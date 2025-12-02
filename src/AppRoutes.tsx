import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { DevicesPage } from "./pages/DevicesPage";
import { DeviceDetailPage } from "./pages/DeviceDetailPage";
import LoginPage from "./pages/LoginPage";
import { DraftOrderPage } from "./pages/DraftOrderPage";
import { MyOrdersPage } from "./pages/MyOrdersPage";
import ProfilePage from "./pages/ProfilePage";
import { ROUTES } from './Routes';

export const AppRoutes: React.FC = () => {
  const location = useLocation();
  
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.CATALOG} element={<DevicesPage />} />
      <Route path={ROUTES.DEVICE_DETAIL} element={<DeviceDetailPage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/my-orders" element={<MyOrdersPage />} />
      <Route 
        path={ROUTES.DRAFT} 
        element={<DraftOrderPage key={location.pathname} />} 
      />
    </Routes>
  );
};