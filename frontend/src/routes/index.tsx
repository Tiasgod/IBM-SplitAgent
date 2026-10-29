import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import Assistente from "../pages/Assistente";
import Simulador from "../pages/Simulador";
import VisaoGeral from "../pages/VisaoGeral";
import Login from "../pages/Login";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<AppShell />}>
          <Route index element={<VisaoGeral />} />
          <Route path="/assistente" element={<Assistente />} />
          <Route path="/simulador" element={<Simulador />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
