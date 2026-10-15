import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import { ServiceScopeProvider } from "./common/ServiceScopeProvider";
import { AppServiceScope } from "./services/AppServiceScope";

const serviceScope = new AppServiceScope();

const root = createRoot(document.getElementById("root")!);

root.render(
  <FluentProvider theme={webLightTheme}>
    <ServiceScopeProvider scope={serviceScope}>
      <App />
    </ServiceScopeProvider>
  </FluentProvider>,
);
