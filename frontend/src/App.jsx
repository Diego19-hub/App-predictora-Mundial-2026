import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import AuthLayout from "./layouts/AuthLayout";

import Partidos from "./pages/Partidos/Partidos";
import Predicciones from "./pages/Predicciones/Predicciones";
import Clasificacion from "./pages/Clasificacion/Clasificacion";
import Perfil from "./pages/Perfil/Perfil";
import EditarAvatar from "./pages/Perfil/EditarAvatar";
import RecoverPassword from "./pages/RecoverPassword/RecoverPassword";
import AdminResultados from "./pages/AdminResultados/AdminResultados";


import PrivateRoute from "./routes/PrivateRoute";
import PrivateLayout from "./layouts/PrivateLayout";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/partidos"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <Partidos />
              </PrivateLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/predicciones"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <Predicciones />
              </PrivateLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/clasificacion"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <Clasificacion />
              </PrivateLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/perfil"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <Perfil />
              </PrivateLayout>
            </PrivateRoute>
          }
        />
        <Route
        path="/recover-password"
        element={<RecoverPassword />}
      />

      <Route
        path="/perfil/editar"
        element={
          <PrivateRoute>
            <PrivateLayout>
              <EditarAvatar />
            </PrivateLayout>
          </PrivateRoute>
        }
      />
      <Route path="/admin/resultados" element={<AdminResultados />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;