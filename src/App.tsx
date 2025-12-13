import React from "react";
import { BrowserRouter, Routes, Route} from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { DevicesPage } from "./pages/DevicesPage";
import { DeviceDetailPage } from "./pages/DeviceDetailPage";
import { Header } from "./components/Header";
import { dest_root } from "./target_config"

export const App: React.FC = () => {
  return (
    <BrowserRouter basename={dest_root}> 
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<DevicesPage />} />
          <Route path="/detailed_device/:id" element={<DeviceDetailPage />} />
        </Routes>
      </BrowserRouter>
  );
};


export default App;
