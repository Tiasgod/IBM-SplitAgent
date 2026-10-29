import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import Assistente from "../pages/Assistente";
import Simulador from "../pages/Simulador";
import FluxoDeCaixa from "../pages/FluxoDeCaixa";
import Configuracoes from "../pages/Configuracoes";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/simulador" replace />} />
          <Route path="/assistente" element={<Assistente />} />
          <Route path="/simulador" element={<Simulador />} />
          <Route path="/fluxo" element={<FluxoDeCaixa />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
