import { createContext } from "react";
import { AppServiceScope } from "../services/AppServiceScope";

export const ServiceScopeContext = createContext<AppServiceScope | null>(null);