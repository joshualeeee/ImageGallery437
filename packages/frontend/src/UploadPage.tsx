import { useId, useState, useActionState } from "react";

type ActionResult = {
  type: "success" | "error";
  message: string;
};

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.readAsDataURL(file);
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = (err) => reject(err);
  });
}

export function UploadPage() {
  const imageUploadId = useId();
  const imageTitleId = useId();
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const dataUrl = await readAsDataURL(file);
      setPreviewUrl(dataUrl);
    }
  };

  const [result, submitAction, isPending] = useActionState<ActionResult | null>(
    async () => {
      const form = document.querySelector("form") as HTMLFormElement;
      const formData = new FormData(form);
      try {
        const authToken = localStorage.getItem("authToken");
        console.log("Auth token present:", !!authToken);

        const response = await fetch("/api/images", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          body: formData,
        });


        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Upload failed:", errorData);
          throw new Error(
            errorData.message || `Upload failed with status ${response.status}`
          );
        }

        console.log("Upload successful");
        return {
          type: "success",
          message: "Image uploaded successfully",
        };
      } catch (error) {
        console.error("Upload error:", error);
        return {
          type: "error",
          message:
            error instanceof Error ? error.message : "Failed to upload image",
        };
      }
    },
    null
  );

  return (
    <>
      <form action={submitAction}>
        <div>
          <label htmlFor={imageUploadId}>Choose image to upload: </label>
          <input
            id={imageUploadId}
            name="image"
            type="file"
            accept=".png,.jpg,.jpeg"
            required
            onChange={handleFileChange}
            disabled={isPending}
          />
        </div>
        <div>
          <label htmlFor={imageTitleId}>
            <span>Image title: </span>
            <input
              id={imageTitleId}
              name="name"
              required
              disabled={isPending}
            />
          </label>
        </div>

        <div>
          {previewUrl && (
            <img
              style={{ width: "20em", maxWidth: "100%" }}
              src={previewUrl}
              alt="Preview"
            />
          )}
        </div>

        <input type="submit" value="Confirm upload" disabled={isPending} />
      </form>
      <div
        aria-live="polite"
        style={{
          marginTop: "1em",
          color: result?.type === "error" ? "red" : "green",
        }}
      >
        {result?.message}
      </div>
    </>
  );
}
