import React from "react";
import { BrowserRouter, Routes, Route} from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { DevicesPage } from "./pages/DevicesPage";
import { DeviceDetailPage } from "./pages/DeviceDetailPage";
import { Header } from "./components/Header";

export const App: React.FC = () => {
  return (
    <BrowserRouter basename="/Electromagnetic_radiation_front"> 
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
