import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import { registerSW } from "virtual:pwa-register";
import { store } from "/home/qwofuh/mygit/ripfront/src/store";
import { Provider } from "react-redux";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
        <App />
    </Provider>
  </React.StrictMode>
);


// Service Worker после рендера
if ("serviceWorker" in navigator) {
  registerSW();
}