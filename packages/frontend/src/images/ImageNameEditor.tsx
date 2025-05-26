import { useState } from "react";
import type { IApiImageData } from "csc437-monorepo-backend/src/common/ApiImageData";

interface INameEditorProps {
  initialValue: string;
  imageId: string;
  images: IApiImageData[];
  setImages: (images: IApiImageData[]) => void;
}

export function ImageNameEditor(props: INameEditorProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [input, setInput] = useState(props.initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmitPressed() {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call by fetching current data
      const response = await fetch("/api/images");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update the images array with the new name
      const updatedImages = props.images.map((image) =>
        image.id === props.imageId ? { ...image, name: input } : image
      );

      props.setImages(updatedImages);
      setIsEditingName(false);
    } catch (err) {
      setError("Failed to update image name. Please try again.");
      console.error("Error updating image name:", err);
    } finally {
      setIsLoading(false);
    }
  }

  if (isEditingName) {
    return (
      <div style={{ margin: "1em 0" }}>
        {error && (
          <div style={{ color: "red", marginBottom: "0.5em" }}>{error}</div>
        )}
        <label>
          New Name{" "}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
        </label>
        <button
          disabled={input.length === 0 || isLoading}
          onClick={handleSubmitPressed}
        >
          {isLoading ? "Working..." : "Submit"}
        </button>
        <button
          onClick={() => {
            setIsEditingName(false);
            setError(null);
          }}
          disabled={isLoading}
        >
          Cancel
        </button>
      </div>
    );
  } else {
    return (
      <div style={{ margin: "1em 0" }}>
        <button onClick={() => setIsEditingName(true)}>Edit name</button>
      </div>
    );
  }
}
