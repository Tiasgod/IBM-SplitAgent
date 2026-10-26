import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppShell from "../components/layout/AppShell";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}