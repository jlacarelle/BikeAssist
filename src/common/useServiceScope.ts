import { useContext } from "react";
import { ServiceScopeContext } from "./ServiceScopeContext";
import type { AppServiceScope } from "../services/AppServiceScope";

export function useServiceScope(): AppServiceScope {
  const scope = useContext(ServiceScopeContext);
  if (!scope) {
    throw new Error("useServiceScope doit être utilisé sous ServiceScopeProvider.");
  }
  return scope;
}