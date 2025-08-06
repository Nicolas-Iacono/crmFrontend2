import { Route, Routes, BrowserRouter } from "react-router-dom";
import Home from "./components/pages/Home";
import PropiedadesPage from "./components/pages/PropiedadesPage";
import InquilinosPage from "./components/pages/InquilinosPage";
import PropietariosPage from "./components/pages/PropietariosPage.jsx";
import GarantesPage from "./components/pages/GarantesPage";
import ContratosPage from "./components/pages/ContratosPage";
import TablaCol from "./components/common/tablas/TablaCol.jsx"
import { Layout } from "./components/layout/Layout";
import "./App.css";
import NuevaPropiedad from "./components/pages/pagesForm/NuevaPropiedad.jsx";
import NuevoInquilino from "./components/pages/pagesForm/NuevoInquilino.jsx";
import NuevoPropietario from "./components/pages/pagesForm/NuevoPropietario.jsx";
import NuevoContrato from "./components/pages/pagesForm/NuevoContrato.jsx";
import NuevoGarante from "./components/pages/pagesForm/NuevoGarante.jsx";
import { EditorTextContextProvider } from "./components/context/EditorGlobal.jsx";
import Registro from "./components/pages/user/registro/Registro.jsx";
import Login from "./components/pages/user/login/Login.jsx";
import { GlobalAuth } from "./components/context/GlobalAuth.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import UsersControl from "./components/common/mobile/UsersControl";
import UserSettings from "./components/pages/user/UserSettings";

import NuevoInterviniente from "./components/pages/pagesForm/NuevoInterviniente.jsx";
import NuevoServicio from "./components/pages/pagesForm/NuevoServicio.jsx"
import NuevoRecibo from "./components/pages/pagesForm/NuevoRecibo.jsx";
import ReciboForm from "./components/pages/pagesForm/ReciboForm.jsx";
import CrearContratoPage from "./components/pages/CrearContratoPage.jsx";
import './styles/swal-toast.css';
import { useAuth } from "./components/context/GlobalAuth";
import { Navigate } from "react-router-dom";
import CalculadoraDeAlquileres from "./components/pages/CalculadoraDeAlquileres";
function App() {
    return (
      <EditorTextContextProvider>
        <BrowserRouter>
          <GlobalAuth>
            <AppRoutes />
          </GlobalAuth>
        </BrowserRouter>
      </EditorTextContextProvider>
    );
  }
  
  // ⬇️ Aquí se declara AppRoutes
  function AppRoutes() {
    const { isLogged, isLoading } = useAuth();
  
    // Mostrar loading mientras se verifica la autenticación
    if (isLoading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px'
        }}>
          Cargando...
        </div>
      );
    }
  
    return (
      <Routes>
        {/* Rutas públicas (sin autenticación) */}
        <Route path="/auth" element={<Registro />} />
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas */}
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Home />} />
          <Route path="users-controls" element={<UsersControl />} />
          <Route path="propiedades" element={<PropiedadesPage />} />
          <Route path="nueva-propiedad" element={<NuevaPropiedad />} />
          <Route path="inquilinos" element={<InquilinosPage />} />
          <Route path="nuevo-inquilino" element={<NuevoInquilino />} />
          <Route path="propietarios" element={<PropietariosPage />} />
          <Route path="nuevo-propietario" element={<NuevoPropietario />} />
          <Route path="contratos" element={<ContratosPage />} />
          <Route path="contratos/crear" element={<CrearContratoPage />} />
          <Route path="nuevo-contrato" element={<NuevoContrato />} />
          <Route path="recibo" element={<ReciboForm />} />
          <Route path="recibos/:id" element={<ReciboForm />} />
          <Route path="nuevo-servicio" element={<NuevoServicio />} />
          <Route path="nuevo-recibo" element={<NuevoRecibo />} />
          <Route path="garantes" element={<GarantesPage />} />
          <Route path="nuevo-garante" element={<NuevoGarante />} />
          <Route path="ajustes" element={<UserSettings />} />
          <Route path="calculadora-de-alquileres" element={<CalculadoraDeAlquileres />} />
        </Route>
      </Routes>
    );
  }
  

export default App;
