import { useParams } from "react-router";
import type { IApiImageData } from "csc437-monorepo-backend/src/common/ApiImageData";
import { ImageNameEditor } from "./ImageNameEditor";

interface ImageDetailsProps {
  images: IApiImageData[];
  setImages: (images: IApiImageData[]) => void;
  authToken: string;
}

export function ImageDetails({
  images,
  setImages,
  authToken,
}: ImageDetailsProps) {
  const { imageId } = useParams();
  const image = images.find((image) => image.id === imageId);
  if (!image) {
    return (
      <>
        <h2>Image not found</h2>
      </>
    );
  }

  return (
    <>
      <h2>{image.name}</h2>
      <ImageNameEditor
        initialValue={image.name}
        imageId={image.id}
        images={images}
        setImages={setImages}
        authToken={authToken}
      />
      <p>By {image.author.username}</p>
      <img className="ImageDetails-img" src={image.src} alt={image.name} />
    </>
  );
}
