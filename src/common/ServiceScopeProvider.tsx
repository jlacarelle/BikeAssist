import { type FC, type ReactNode } from "react";
import { ServiceScopeContext } from "./ServiceScopeContext";
import type { AppServiceScope } from "../services/AppServiceScope";

type ServiceScopeProviderProps = {
  scope: AppServiceScope;
  children: ReactNode;
};

export const ServiceScopeProvider: FC<ServiceScopeProviderProps> = ({
  scope,
  children,
}) => (
  <ServiceScopeContext.Provider value={scope}>
    {children}
  </ServiceScopeContext.Provider>
);