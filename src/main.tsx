import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

document.title = "TallyWeb";

const themeColor = document.querySelector("meta[name='theme-color']") ?? (() => {
  const meta = document.createElement("meta");
  meta.setAttribute("name", "theme-color");
  document.head.appendChild(meta);
  return meta;
})();

themeColor.setAttribute("content", "#0d6b5c");

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
