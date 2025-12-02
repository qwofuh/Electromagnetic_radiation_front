import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core"; // Импортируем invoke
import { Header } from "./components/Header";
import { dest_root } from "../target_config"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AppRoutes } from "./AppRoutes";

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
        <AppRoutes /> {/* ⬅️ используй AppRoutes вместо прямых Routes */}
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </BrowserRouter>
  );
};

export default App;