import { Node } from "@xyflow/react";
import { ImageNodeData } from "./types";
import { useEditorStore } from "./editorStore";

interface Props {
  localNode: Node<ImageNodeData>;
  handleFieldChange: (field: string, value: any) => void;
}

/**
 * Compress an image file using the Canvas API.
 * Resizes the image to fit within maxWidth x maxHeight while maintaining aspect ratio.
 * PNG images are converted to JPEG for better compression.
 * 
 * @param file - The image file to compress
 * @param maxWidth - Maximum width in pixels (default: 1920)
 * @param maxHeight - Maximum height in pixels (default: 1920)
 * @param quality - JPEG compression quality from 0 to 1 (default: 0.85)
 * @returns Promise that resolves to a base64 data URL of the compressed image
 * @throws Error if image loading or canvas operations fail
 */
async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          if (width > height) {
            width = maxWidth;
            height = maxWidth / aspectRatio;
          } else {
            height = maxHeight;
            width = maxHeight * aspectRatio;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Clear canvas to transparent (important for PNGs)
        ctx.clearRect(0, 0, width, height);

        ctx.drawImage(img, 0, 0, width, height);

        // Preserve PNG transparency, use JPEG for other formats
        const isPNG = file.type === 'image/png';
        const mimeType = isPNG ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);

        resolve(dataUrl);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

export function EditorDrawerImageContent({ localNode, handleFieldChange }: Props) {
  const getTranslationsFromStore = useEditorStore(state => state.getTranslations);
  const t = getTranslationsFromStore();

  // Convert file to base64 with compression
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // For SVG files, don't compress (they're already vector graphics)
      if (file.type === 'image/svg+xml') {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            handleFieldChange("data", reader.result);
          }
        };
        reader.readAsDataURL(file);
      } else {
        // Compress JPEG, PNG, and WebP images
        const compressedDataUrl = await compressImage(file);
        handleFieldChange("data", compressedDataUrl);
      }
    } catch (error) {
      console.error("Failed to process image:", error);
      // Fallback to original file if compression fails
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          handleFieldChange("data", reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="panel-content">
      <div className="form-group">
        <label>{t.image} (JPG, PNG, WebP, SVG)</label>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={handleFileChange}
        />
      </div>
      <div className="form-group">
        <label>{t.caption}</label>
        <input
          type="text"
          value={localNode.data.caption || ""}
          onChange={(e) => handleFieldChange("caption", e.target.value)}
          placeholder={t.placeholderImageCaption}
        />
      </div>
      {localNode.data.data && (
        <div style={{ marginTop: 16 }}>
          <label>Preview:</label>
          <div>
            <img src={localNode.data.data} alt="Preview" style={{ maxWidth: "100%", maxHeight: 200 }} />
          </div>
        </div>
      )}
    </div>
  );
}
