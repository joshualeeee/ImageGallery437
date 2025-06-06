import { AllImages } from "./images/AllImages.tsx";
import { ImageDetails } from "./images/ImageDetails.tsx";
import { UploadPage } from "./UploadPage.tsx";
import { LoginPage } from "./LoginPage.tsx";
import { Routes, Route } from "react-router";
import { MainLayout } from "./MainLayout.tsx";
import { ValidRoutes } from "csc437-monorepo-backend/src/shared/ValidRoutes";
import { useState, useEffect, useRef } from "react";
import type { IApiImageData } from "csc437-monorepo-backend/src/common/ApiImageData";
import { ImageSearchForm } from "./images/ImageSearchForm.tsx";

function App() {
  const [imageData, setImageData] = useState<IApiImageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [searchString, handleImageSearch] = useState("");
  const requestCounterRef = useRef(0);

  const fetchImages = async (searchQuery?: string) => {
    setIsLoading(true);
    setHasError(false);

    // Increment the counter and save this request's number
    requestCounterRef.current += 1;
    const thisRequestNumber = requestCounterRef.current;

    try {
      const url = searchQuery
        ? `/api/images/search?q=${encodeURIComponent(searchQuery)}`
        : "/api/images";

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Only update state if this is still the most recent request
      if (thisRequestNumber === requestCounterRef.current) {
        setImageData(data);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      // Only update error state if this is still the most recent request
      if (thisRequestNumber === requestCounterRef.current) {
        setHasError(true);
        setImageData([]);
      }
    } finally {
      // Only update loading state if this is still the most recent request
      if (thisRequestNumber === requestCounterRef.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleSearchRequested = () => {
    fetchImages(searchString);
  };

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
              searchPanel={
                <ImageSearchForm
                  searchString={searchString}
                  onSearchStringChange={handleImageSearch}
                  onSearchRequested={handleSearchRequested}
                />
              }
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
