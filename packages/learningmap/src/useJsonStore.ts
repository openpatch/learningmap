import { useCallback } from "react";
import { useEditorStore } from "./editorStore";
import { getTranslations } from "./translations";

export const useJsonStore = () => {
  const jsonStore = useEditorStore((state) => state.jsonStore);
  const getRoadmapData = useEditorStore((state) => state.getRoadmapData);
  const language = useEditorStore((state) => state.settings.language);
  const defaultLanguage = useEditorStore((state) => state.defaultLanguage);
  const t = getTranslations(language || defaultLanguage);
  const setShareLink = useEditorStore((state) => state.setShareLink);
  const setShareDialogOpen = useEditorStore(
    (state) => state.setShareDialogOpen,
  );
  const setLoadExternalDialogOpen = useEditorStore(
    (state) => state.setLoadExternalDialogOpen,
  );
  const setPendingExternalId = useEditorStore(
    (state) => state.setPendingExternalId,
  );
  const loadRoadmapData = useEditorStore((state) => state.loadRoadmapData);

  const post = useCallback(() => {
    const roadmapData = getRoadmapData();

    if (!roadmapData.nodes || roadmapData.nodes.length === 0) {
      alert(t.emptyMapCannotBeShared);
      return;
    }

    fetch(`${jsonStore}/api/v2/post`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(roadmapData),
    })
      .then((r) => r.json())
      .then((json) => {
        const link =
          window.location.origin +
          window.location.pathname +
          "#json=" +
          json.id;
        setShareLink(link);
        setShareDialogOpen(true);
      })
      .catch(() => {
        alert(t.uploadFailed);
      });
  }, [getRoadmapData, jsonStore, t, setShareLink, setShareDialogOpen]);

  const get = useCallback(
    (id: string) => {
      fetch(`${jsonStore}/api/v2/${id}`, {
        method: "GET",
        mode: "cors",
      })
        .then((r) => r.text())
        .then((text) => {
          const json = JSON.parse(text);
          loadRoadmapData(json);
          setLoadExternalDialogOpen(false);
          setPendingExternalId(null);
        })
        .catch(() => {
          alert(t.loadFailed);
          setLoadExternalDialogOpen(false);
          setPendingExternalId(null);
          window.location.hash = "";
        });
    },
    [jsonStore, t, loadRoadmapData],
  );

  return [get, post] as const;
};
