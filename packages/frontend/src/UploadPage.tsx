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
        const response = await fetch("/api/images", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        return {
          type: "success",
          message: "Image uploaded successfully",
        };
      } catch (error) {
        return {
          type: "error",
          message: "Failed to upload image",
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
          {" "}
          {/* Preview img element */}
          <img
            style={{ width: "20em", maxWidth: "100%" }}
            src={previewUrl}
            alt=""
          />
        </div>

        <input type="submit" value="Confirm upload" disabled={isPending} />
      </form>
      <div aria-live="polite">{result?.message}</div>
    </>
  );
}
