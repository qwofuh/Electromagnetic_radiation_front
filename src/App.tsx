import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route} from "react-router-dom";
import { invoke } from "@tauri-apps/api/core"; // Импортируем invoke
import { HomePage } from "./pages/HomePage";
import { DevicesPage } from "./pages/DevicesPage";
import { DeviceDetailPage } from "./pages/DeviceDetailPage";
import { Header } from "./components/Header";
import { dest_root } from "../target_config"

export const App: React.FC = () => {
  useEffect(() => {
    // Вызываем Tauri команду при монтировании компонента
    invoke('tauri', { cmd: 'create' })
      .then(() => {
        console.log("Tauri launched successfully");
      })
      .catch((error) => {
        console.log("Tauri not launched:", error);
      });

    // Функция очистки при размонтировании компонента
    return () => {
      invoke('tauri', { cmd: 'close' })
        .then(() => {
          console.log("Tauri closed successfully");
        })
        .catch((error) => {
          console.log("Error closing Tauri:", error);
        });
    };
  }, []); // Пустой массив зависимостей - эффект выполнится только при монтировании

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