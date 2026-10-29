import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import Assistente from "../pages/Assistente";
import Simulador from "../pages/Simulador";
import VisaoGeral from "../pages/VisaoGeral";
import Login from "../pages/Login";
import Cadastro from "../pages/Cadastro";
import Inicio from "../pages/Inicio";
import FluxoDeCaixa from "../pages/FluxoDeCaixa";
import Configuracoes from "../pages/Configuracoes";
import Historico from "../pages/Historico";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route element={<AppShell />}>
          <Route path="/visao-geral" element={<VisaoGeral />} />
          <Route path="/assistente" element={<Assistente />} />
          <Route path="/simulador" element={<Simulador />} />
          <Route path="/fluxo" element={<FluxoDeCaixa />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
