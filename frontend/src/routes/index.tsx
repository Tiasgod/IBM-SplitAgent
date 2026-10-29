import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import Assistente from "../pages/Assistente";
import Simulador from "../pages/Simulador";
import VisaoGeral from "../pages/VisaoGeral";
import Login from "../pages/Login";
import FluxoDeCaixa from "../pages/FluxoDeCaixa";
import Configuracoes from "../pages/Configuracoes";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<AppShell />}>
          <Route index element={<VisaoGeral />} />
          <Route path="/assistente" element={<Assistente />} />
          <Route path="/simulador" element={<Simulador />} />
          <Route path="/fluxo" element={<FluxoDeCaixa />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
