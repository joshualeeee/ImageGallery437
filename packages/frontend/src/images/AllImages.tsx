import { ImageGrid } from "./ImageGrid.tsx";
import type { IImageData } from "../MockAppData.ts";

interface AllImagesProps {
  images: IImageData[];
}

export function AllImages({ images }: AllImagesProps) {
  return (
    <>
      <h2>All Images</h2>
      <ImageGrid images={images} />
    </>
  );
}