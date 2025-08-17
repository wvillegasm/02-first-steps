import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FirstStepsApp } from "./FirstStepsApp";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FirstStepsApp />
  </StrictMode>
);
