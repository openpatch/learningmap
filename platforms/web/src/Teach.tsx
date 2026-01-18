import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as db from "./db";
import type { TeacherMapEntry } from "./db";
import "./Teach.css";
import { Header } from "./Header";
import { Footer } from "./Footer";

function Teach() {
  const navigate = useNavigate();
  const [allMaps, setAllMaps] = useState<TeacherMapEntry[]>([]);
  const [newMapUrl, setNewMapUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDataDialog, setShowDataDialog] = useState(false);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictData, setConflictData] = useState<{
    storageId: string;
    roadmapData: any;
    jsonId?: string;
    existingMap: TeacherMapEntry;
  } | null>(null);

  const handleExport = async () => {
    try {
      const data = await db.exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `learningmap-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setShowDataDialog(false);
    } catch (err) {
      alert("Failed to export data");
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        await db.importAllData(data);
        alert("Data imported successfully! Refresh the page to see all changes.");
        setShowDataDialog(false);
        // Refresh the maps list
        const maps = await db.getAllTeacherMaps();
        setAllMaps(maps);
      } catch (err) {
        alert("Failed to import data. Please check the file format.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  useEffect(() => {
    db.getAllTeacherMaps().then(setAllMaps);
  }, []);

  const handleRemoveMap = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to remove this learning map from your collection?",
      )
    ) {
      await db.removeTeacherMap(id);
      const maps = await db.getAllTeacherMaps();
      setAllMaps(maps);
    }
  };

  const handleEditMap = (map: TeacherMapEntry) => {
    // Use jsonId if published, otherwise use the local storage ID
    const editId = map.jsonId || map.id;
    navigate(`/create#id=${editId}`);
  };

  const handleAddMapFromUrl = async () => {
    setError(null);
    const trimmedUrl = newMapUrl.trim();

    if (!trimmedUrl) {
      setError("Please enter a URL");
      return;
    }

    // Extract jsonId from URL
    const match = trimmedUrl.match(/#json=([^&]+)/);
    if (match) {
      const jsonId = match[1];

      // Check if it looks like a storage ID (contains . or /)
      if (jsonId.includes(".") || jsonId.includes("/")) {
        setError(
          "Cannot import maps with custom storage IDs. Please use a published map URL.",
        );
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `https://json.openpatch.org/api/v2/${jsonId}`,
          {
            method: "GET",
            mode: "cors",
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch learning map");
        }

        const roadmapData = await response.json();
        const settingsId = roadmapData.settings?.id || jsonId;

        // Check if a map with the same settings.id already exists
        const existingMap = await db.findTeacherMapBySettingsId(settingsId);
        if (existingMap) {
          // Show conflict dialog
          setConflictData({
            storageId: existingMap.id,
            roadmapData,
            jsonId,
            existingMap,
          });
          setShowConflictDialog(true);
          setLoading(false);
          return;
        }

        // Generate a unique database ID
        const dbId = `map-${Date.now()}`;
        await db.addTeacherMap(dbId, roadmapData, jsonId);
        const maps = await db.getAllTeacherMaps();
        setAllMaps(maps);
        setNewMapUrl("");
        setShowAddDialog(false);
      } catch (err) {
        setError(
          "Failed to load learning map. Please check the URL and try again.",
        );
      } finally {
        setLoading(false);
      }
    } else {
      setError(
        "Invalid learning map URL. Please paste a valid URL with #json=...",
      );
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const json = JSON.parse(content);

        const settingsId = json.settings?.id;

        // Check if a map with the same settings.id already exists
        const existingMap = settingsId
          ? await db.findTeacherMapBySettingsId(settingsId)
          : undefined;
        if (existingMap) {
          // Show conflict dialog
          setConflictData({
            storageId: existingMap.id,
            roadmapData: json,
            existingMap,
          });
          setShowConflictDialog(true);
          return;
        }

        // Generate a unique database ID
        const dbId = `map-${Date.now()}`;
        await db.addTeacherMap(dbId, json, undefined);
        const maps = await db.getAllTeacherMaps();
        setAllMaps(maps);
        setShowAddDialog(false);
      } catch (err) {
        setError(
          "Invalid file format. Please upload a valid LearningMap JSON file.",
        );
      }
    };

    reader.onerror = () => {
      setError("Failed to read the file. Please try again.");
    };

    reader.readAsText(file);

    // Reset the input so the same file can be uploaded again if needed
    event.target.value = "";
  };

  const handleConflictOverwrite = async () => {
    if (!conflictData) return;

    // Overwrite the existing map (keep same database ID)
    await db.addTeacherMap(
      conflictData.storageId,
      conflictData.roadmapData,
      conflictData.jsonId,
    );
    const maps = await db.getAllTeacherMaps();
    setAllMaps(maps);
    setNewMapUrl("");
    setShowAddDialog(false);
    setShowConflictDialog(false);
    setConflictData(null);
  };

  const handleConflictNewId = async () => {
    if (!conflictData) return;

    // Generate a new unique database ID
    const newDbId = `map-${Date.now()}`;

    // Generate a new settings.id to avoid conflicts
    const currentSettingsId = conflictData.roadmapData.settings?.id || "map";
    const newSettingsId = `${currentSettingsId}-${Date.now()}`;

    // Update the ID in the roadmap settings
    const updatedRoadmapData = {
      ...conflictData.roadmapData,
      settings: {
        ...conflictData.roadmapData.settings,
        id: newSettingsId,
      },
    };

    await db.addTeacherMap(newDbId, updatedRoadmapData, conflictData.jsonId);
    const maps = await db.getAllTeacherMaps();
    setAllMaps(maps);
    setNewMapUrl("");
    setShowAddDialog(false);
    setShowConflictDialog(false);
    setConflictData(null);
  };

  const handleConflictCancel = () => {
    setShowConflictDialog(false);
    setConflictData(null);
  };

  return (
    <div className="teach-container">
      <Header>
        <button
          onClick={() => navigate("/create")}
          className="toolbar-button toolbar-button-primary"
        >
          New Map
        </button>
        <button
          onClick={() => setShowAddDialog(true)}
          className="toolbar-button"
        >
          Add Map
        </button>
        <button onClick={() => setShowDataDialog(true)} className="nav-button">
          Manage Data
        </button>
      </Header>

      {showAddDialog && (
        <div className="dialog-overlay" onClick={() => setShowAddDialog(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2>Add an Existing Learning Map</h2>
              <button
                className="dialog-close"
                onClick={() => setShowAddDialog(false)}
                aria-label="Close dialog"
              >
                ×
              </button>
            </div>
            <div className="dialog-body">
              <div className="add-map-form">
                <input
                  type="text"
                  placeholder="Paste learning map URL (e.g., https://learningmap.app/learn#json=...)"
                  value={newMapUrl}
                  onChange={(e) => setNewMapUrl(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddMapFromUrl();
                    }
                  }}
                />
                <button onClick={handleAddMapFromUrl} disabled={loading}>
                  {loading ? "Adding..." : "Add Map"}
                </button>
              </div>
              {error && <p className="error-message">{error}</p>}
              <div className="add-map-divider">
                <span>or</span>
              </div>
              <div className="add-map-upload">
                <label htmlFor="file-upload" className="upload-button">
                  📁 Upload JSON File
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showConflictDialog && conflictData && (
        <div className="dialog-overlay" onClick={handleConflictCancel}>
          <div
            className="dialog-content conflict-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dialog-header">
              <h2>⚠️ Map Already Exists</h2>
              <button
                className="dialog-close"
                onClick={handleConflictCancel}
                aria-label="Close dialog"
              >
                ×
              </button>
            </div>
            <div className="dialog-body">
              <p>
                A learning map with ID <strong>{conflictData.storageId}</strong>{" "}
                already exists in your collection.
              </p>
              <div className="conflict-info">
                <div className="conflict-map-info">
                  <h4>Existing Map:</h4>
                  <p>
                    <strong>
                      {conflictData.existingMap.roadmapData.settings?.title ||
                        "Untitled"}
                    </strong>
                  </p>
                  <p className="text-small">
                    Last modified:{" "}
                    {new Date(
                      conflictData.existingMap.lastModified,
                    ).toLocaleString()}
                  </p>
                </div>
                <div className="conflict-map-info">
                  <h4>New Map:</h4>
                  <p>
                    <strong>
                      {conflictData.roadmapData.settings?.title || "Untitled"}
                    </strong>
                  </p>
                </div>
              </div>
              <p>What would you like to do?</p>
              <div className="conflict-actions">
                <button
                  onClick={handleConflictOverwrite}
                  className="conflict-button conflict-button-danger"
                >
                  Overwrite Existing
                </button>
                <button
                  onClick={handleConflictNewId}
                  className="conflict-button conflict-button-primary"
                >
                  Keep Both (New ID)
                </button>
                <button
                  onClick={handleConflictCancel}
                  className="conflict-button conflict-button-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDataDialog && (
        <div className="dialog-overlay" onClick={() => setShowDataDialog(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2>Manage Your Data</h2>
              <button
                className="dialog-close"
                onClick={() => setShowDataDialog(false)}
                aria-label="Close dialog"
              >
                ×
              </button>
            </div>
            <div className="dialog-body">
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ marginBottom: "0.5rem" }}>Backup Your Data</h3>
                <p style={{ marginBottom: "1rem", color: "#666" }}>
                  Download all your created maps and student learning maps as a JSON file. 
                  Keep this file safe to restore your data later or transfer to another device.
                </p>
                <button onClick={handleExport} className="role-button role-button-primary" style={{ width: "100%" }}>
                  Download Backup
                </button>
              </div>
              
              <div style={{ borderTop: "1px solid #ddd", paddingTop: "1.5rem" }}>
                <h3 style={{ marginBottom: "0.5rem" }}>Restore from Backup</h3>
                <p style={{ marginBottom: "1rem", color: "#666" }}>
                  Upload a previously downloaded backup file to restore your maps. 
                  This will merge with your existing data.
                </p>
                <label className="role-button role-button-secondary" style={{ cursor: "pointer", display: "block", width: "100%", textAlign: "center", boxSizing: "border-box" }}>
                  Upload Backup
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleImport}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="teach-content">
        <div className="page-header">
          <h2>
            <span className="page-emoji">👩‍🏫</span> My Created Maps
          </h2>
          <p className="page-subheading">
            Manage your learning maps. Edit, share with students, or create new
            ones.
          </p>
        </div>

        {allMaps.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No learning maps yet</h3>
            <p>
              Create your first learning map and share it with your students.
            </p>
            <button
              onClick={() => navigate("/create")}
              className="empty-action-button"
            >
              Create Your First Map
            </button>
          </div>
        ) : (
          <div className="maps-grid">
            {allMaps.map((map) => (
              <div key={map.id} className="map-card">
                <div className="map-card-header">
                  <h3>{map.roadmapData.settings?.title || "Untitled Map"}</h3>
                  <button
                    onClick={() => handleRemoveMap(map.id)}
                    className="remove-button"
                    title="Remove from collection"
                  >
                    ×
                  </button>
                </div>
                <div className="map-card-body">
                  <div className="map-stats">
                    <span className="stat">
                      📍{" "}
                      {map.roadmapData.nodes?.filter(
                        (n) => n.type === "task" || n.type === "topic",
                      ).length || 0}{" "}
                      tasks
                    </span>
                  </div>
                  <div className="map-meta">
                    <span>
                      Created: {new Date(map.createdAt).toLocaleDateString()}
                    </span>
                    <span>
                      Modified:{" "}
                      {new Date(map.lastModified).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="map-card-footer">
                  <button
                    onClick={() => handleEditMap(map)}
                    className="action-button secondary-button"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Teach;
