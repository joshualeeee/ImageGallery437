import { AllImages } from "./images/AllImages.tsx";
import { ImageDetails } from "./images/ImageDetails.tsx";
import { UploadPage } from "./UploadPage.tsx";
import { LoginPage } from "./LoginPage.tsx";
import { Routes, Route, useNavigate } from "react-router";
import { MainLayout } from "./MainLayout.tsx";
import { ValidRoutes } from "csc437-monorepo-backend/src/shared/ValidRoutes";
import { useState, useEffect, useRef } from "react";
import type { IApiImageData } from "csc437-monorepo-backend/src/common/ApiImageData";
import { ImageSearchForm } from "./images/ImageSearchForm.tsx";
import { ProtectedRoute } from "./ProtectedRoute.tsx";

function App() {
  const [imageData, setImageData] = useState<IApiImageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [searchString, handleImageSearch] = useState("");
  const requestCounterRef = useRef(0);
  const [authToken, setAuthToken] = useState<string | null>(() =>
    localStorage.getItem("authToken")
  );
  const navigate = useNavigate();

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

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

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
    if (authToken) {
      fetchImages();
    }
  }, [authToken]);

  const handleSearchRequested = () => {
    fetchImages(searchString);
  };

  const handleAuth = (token: string) => {
    setAuthToken(token);
    navigate("/");
  };

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route
          path={ValidRoutes.HOME}
          element={
            <ProtectedRoute authToken={authToken || ""}>
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
            </ProtectedRoute>
          }
        />
        <Route
          path={ValidRoutes.IMAGE_DETAILS}
          element={
            <ProtectedRoute authToken={authToken || ""}>
              <ImageDetails
                images={imageData}
                setImages={setImageData}
                authToken={authToken || ""}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path={ValidRoutes.UPLOAD}
          element={
            <ProtectedRoute authToken={authToken || ""}>
              <UploadPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ValidRoutes.LOGIN}
          element={<LoginPage isRegistering={false} onAuth={handleAuth} />}
        />
        <Route
          path={ValidRoutes.REGISTER}
          element={<LoginPage isRegistering={true} onAuth={handleAuth} />}
        />
      </Route>
    </Routes>
  );
}

export default App;
