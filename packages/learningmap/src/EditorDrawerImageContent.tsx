import { Node } from "@xyflow/react";
import { ImageNodeData } from "./types";
import { getTranslations } from "./translations";

interface Props {
  localNode: Node<ImageNodeData>;
  handleFieldChange: (field: string, value: any) => void;
  language?: string;
}

// Compress image using Canvas API
async function compressImage(file: File, maxWidth: number = 1920, maxHeight: number = 1920, quality: number = 0.85): Promise<string> {
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
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // For PNG files, try to compress as JPEG if it results in smaller size
        // For JPEG files, always use JPEG format
        const mimeType = file.type === 'image/png' ? 'image/jpeg' : file.type;
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

export function EditorDrawerImageContent({ localNode, handleFieldChange, language = "en" }: Props) {
  const t = getTranslations(language);
  
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
        // Compress JPEG and PNG images
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
        <label>{t.image} (JPG, PNG, SVG)</label>
        <input
          type="file"
          accept="image/png,image/jpeg,image/svg+xml"
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
