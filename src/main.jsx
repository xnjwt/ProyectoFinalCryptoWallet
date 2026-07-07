import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App3";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { useConfigStore } from "./store/configStore";
import "./index.css";


const Root = () => {
  // Aquí extraemos específicamente el objeto de tema dinámico desde Zustand
  const temaDelStore = useConfigStore((state) => state.tema);

  return (
    <ThemeProvider theme={temaDelStore}>
      {/* CssBaseline normaliza los estilos y aplica el color de fondo global (bgcolor) */}
      <CssBaseline /> 
      <App />
    </ThemeProvider>
  );
};
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
