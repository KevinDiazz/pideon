import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import BackendWakeupSplash from "./components/BackendWakeupSplash";

import Menu from "./pages/menu";
import Carrito from "./pages/carrito";
import Checkout from "./pages/checkout";
import Login from "./pages/login";
import Register from "./pages/register";
import MisPedidos from "./pages/misPedidos";

import Admin from "./pages/panels/Admin";
import Cocina from "./pages/panels/Cocina";
import Repartidor from "./pages/panels/Repartidor";

function App() {
  return (
    <>
    <BackendWakeupSplash />
    <Routes>
      {/* 🌐 PÚBLICO */}
      <Route
        path="/"
        element={
          <MainLayout>
            <Menu />
          </MainLayout>
        }
      />

      <Route
        path="/carrito"
        element={
          <MainLayout>
            <Carrito />
          </MainLayout>
        }
      />

      {/* 🔐 AUTH */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 🔐 CLIENTE */}
      <Route
        path="/checkout"
        element={
          <ProtectedRoute allowedRoles={["cliente"]}>
            <MainLayout>
              <Checkout />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mis-pedidos"
        element={
          <ProtectedRoute allowedRoles={["cliente"]}>
            <MainLayout>
              <MisPedidos />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* 🔐 PANELES */}
      <Route
        path="/cocina"
        element={
          <ProtectedRoute allowedRoles={["cocina", "admin"]}>
            <MainLayout withSidebar={false}>
              <Cocina />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/repartidor"
        element={
          <ProtectedRoute allowedRoles={["repartidor", "admin"]}>
            <MainLayout withSidebar={false}>
              <Repartidor />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <MainLayout withSidebar={false}>
              <Admin />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* 404 → home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}

export default App;
