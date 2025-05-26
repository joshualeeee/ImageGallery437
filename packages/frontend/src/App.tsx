import { AllImages } from "./images/AllImages.tsx";
import { ImageDetails } from "./images/ImageDetails.tsx";
import { UploadPage } from "./UploadPage.tsx";
import { LoginPage } from "./LoginPage.tsx";
import { Routes, Route } from "react-router";
import { MainLayout } from "./MainLayout.tsx";
import { ValidRoutes } from "csc437-monorepo-backend/src/shared/ValidRoutes";
import { useState, useEffect } from "react";
import type { IApiImageData } from "csc437-monorepo-backend/src/common/ApiImageData";

function App() {
  const [imageData, setImageData] = useState<IApiImageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("/api/images");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setImageData(data);
      } catch (error) {
        console.error("Error fetching images:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, []);

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route
          path={ValidRoutes.HOME}
          element={
            <AllImages
              images={imageData}
              isLoading={isLoading}
              hasError={hasError}
            />
          }
        />
        <Route
          path={ValidRoutes.IMAGE_DETAILS}
          element={<ImageDetails images={imageData} setImages={setImageData} />}
        />
        <Route path={ValidRoutes.UPLOAD} element={<UploadPage />} />
        <Route path={ValidRoutes.LOGIN} element={<LoginPage />} />
      </Route>
    </Routes>
  );
}

export default App;
