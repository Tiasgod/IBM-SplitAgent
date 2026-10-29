import { createContext, useContext } from "react";

interface AppShellContextValue {
  openDrawer: () => void;
}

export const AppShellContext = createContext<AppShellContextValue>({
  openDrawer: () => {},
});

export function useAppShell() {
  return useContext(AppShellContext);
}
