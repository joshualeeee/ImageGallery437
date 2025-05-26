import { AllImages } from "./images/AllImages.tsx";
import { ImageDetails } from "./images/ImageDetails.tsx";
import { UploadPage } from "./UploadPage.tsx";
import { LoginPage } from "./LoginPage.tsx";
import { Routes, Route } from "react-router";
import { MainLayout } from "./MainLayout.tsx";
import { ValidRoutes } from "csc437-monorepo-backend/src/shared/ValidRoutes";
import { useState } from "react";
import { fetchDataFromServer } from "./MockAppData.ts";

function App() {
  const [imageData, _setImageData] = useState(fetchDataFromServer);

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route
          path={ValidRoutes.HOME}
          element={<AllImages images={imageData} />}
        />
        <Route
          path={ValidRoutes.IMAGE_DETAILS}
          element={<ImageDetails images={imageData} />}
        />
        <Route path={ValidRoutes.UPLOAD} element={<UploadPage />} />
        <Route path={ValidRoutes.LOGIN} element={<LoginPage />} />
      </Route>
    </Routes>
  );
}

export default App;
