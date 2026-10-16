import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import { BrowserRouter } from "react-router-dom";

const root = createRoot(document.getElementById("root")!);

root.render(
  <FluentProvider theme={webLightTheme}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </FluentProvider>,
);
