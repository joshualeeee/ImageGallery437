import { ImageGrid } from "./ImageGrid.tsx";
import type { IApiImageData } from "csc437-monorepo-backend/src/common/ApiImageData";
import React from "react";

interface AllImagesProps {
  images: IApiImageData[];
  isLoading: boolean;
  hasError: boolean;
  searchPanel: React.ReactNode;
}

export function AllImages({
  images,
  isLoading,
  hasError,
  searchPanel,
}: AllImagesProps) {
  if (isLoading) {
    return (
      <>
        <h2>All Images</h2>
        <div>Loading images...</div>
      </>
    );
  }

  if (hasError) {
    return (
      <>
        <h2>All Images</h2>
        <div style={{ color: "red" }}>
          Error loading images. Please try again later.
        </div>
      </>
    );
  }

  return (
    <>
      <h2>All Images</h2>
      {searchPanel}
      <ImageGrid images={images} />
    </>
  );
}
