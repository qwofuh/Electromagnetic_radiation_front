import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { DevicesPage } from "./pages/DevicesPage";
import { DeviceDetailPage } from "./pages/DeviceDetailPage";
import { Header } from "./components/Header";

export const App: React.FC = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<DevicesPage />} />
        <Route path="/detailed_device/:id" element={<DeviceDetailPage />} />
      </Routes>
    </Router>
  );
};


export default App;
