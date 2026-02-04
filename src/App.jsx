import { Route, Routes, BrowserRouter } from "react-router-dom";
import Home from "./components/pages/Home";
import PropiedadesPage from "./components/pages/PropiedadesPage";
import InquilinosPage from "./components/pages/InquilinosPage";
import PropietariosPage from "./components/pages/PropietariosPage.jsx";
import GarantesPage from "./components/pages/GarantesPage";
import ContratosPage from "./components/pages/ContratosPage";
import ProspectosPage from "./components/pages/ProspectosPage";
import TablaCol from "./components/common/tablas/TablaCol.jsx";
import { Layout } from "./components/layout/Layout";
import "./App.css";
import NuevaPropiedad from "./components/pages/pagesForm/NuevaPropiedad.jsx";
import NuevoInquilino from "./components/pages/pagesForm/NuevoInquilino.jsx";
import NuevoPropietario from "./components/pages/pagesForm/NuevoPropietario.jsx";
import NuevoContrato from "./components/pages/pagesForm/NuevoContrato.jsx";
import NuevoContratoForm from "./components/pages/pagesForm/NuevoContratoForm.jsx";
import NuevoGarante from "./components/pages/pagesForm/NuevoGarante.jsx";
import NuevoProspecto from "./components/pages/pagesForm/NuevoProspecto.jsx";
import EditarProspecto from "./components/pages/pagesForm/EditarProspecto.jsx";
import { EditorTextContextProvider } from "./components/context/EditorGlobal.jsx";
import Registro from "./components/pages/user/registro/Registro.jsx";
import Login from './components/pages/user/login/Login'
import RecoverPassword from './components/pages/user/login/RecoverPassword'
import ResetPassword from './components/pages/user/login/ResetPassword.jsx';
import LoginInquilinos from "./components/pages/user/login/LoginInquilinos.jsx";
import DashboardInquilinos from "./components/pages/DashboardPropietario.jsx";
import DashboardUnificado from "./components/pages/DashboardUnificado.jsx";
import { GlobalAuth } from "./components/context/GlobalAuth.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import UsersControl from "./components/common/mobile/UsersControl";
import UserSettings from "./components/pages/user/UserSettings";
import NuevoInterviniente from "./components/pages/pagesForm/NuevoInterviniente.jsx";
import NuevoServicio from "./components/pages/pagesForm/NuevoServicio.jsx";
import NuevoRecibo from "./components/pages/pagesForm/NuevoRecibo.jsx";
import ReciboForm from "./components/pages/pagesForm/ReciboForm.jsx";
import RecibosPage from "./components/pages/RecibosPage.jsx";
import CrearContratoPage from "./components/pages/CrearContratoPage.jsx";
import "./styles/swal-toast.css";
import { useAuth } from "./components/context/GlobalAuth";
import { Navigate } from "react-router-dom";
import CalculadoraDeAlquileres from "./components/pages/CalculadoraDeAlquileres";
import MercadoPagoTest from "./components/pages/MercadoPagoTest.jsx";
import MercadoPagoCallback from "./components/pages/MercadoPagoCallback";
import CalendarioPage from "./components/pages/CalendarioPage";
import AsignarPropietario from "./components/pages/pagesForm/AsignarPropietario";
import EditarPropiedad from "./components/pages/pagesForm/EditarPropiedad.jsx";
import PresupuestoPage from "./components/pages/PresupuestoPage";
import ContabilidadPage from "./components/pages/ContabilidadPage";
import PlantillasPage from "./components/pages/mobile/PlantillasPage.jsx";
import ContactoPage from "./components/pages/ContactoPage";
import themeBreakPoints from "./utils/themeBreakPoints";
import { ThemeProvider } from "@mui/material/styles";
import CreateSubscriptionPlan from "./components/pages/CreateSubscriptionPlan.jsx";
import Swal from "sweetalert2";
import { useEffect } from "react";

// =====================
// 🔔 Control de versión Tuinmo
// =====================
const CURRENT_VERSION = "3.8.1"; // versión local instalada
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.beweb.tuinmo";

function isVersionOlder(installed, latest) {
  const a = installed.split(".").map(Number);
  const b = latest.split(".").map(Number);
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i++) {
    const diff = (b[i] || 0) - (a[i] || 0);
    if (diff > 0) return true; // instalada es más vieja
    if (diff < 0) return false; // instalada es más nueva
  }
  return false; // iguales
}

function App() {
  useEffect(() => {
    // =====================
    //  Verificar versión desde /app-version.json
    // =====================
    async function checkVersion() {
      try {
        const response = await fetch("/app-version.json", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();

        if (data.version && isVersionOlder(CURRENT_VERSION, data.version)) {
          Swal.fire({
            title: "🚀 Nueva versión disponible",
            html: `
              <p>Tenés la versión <b>${CURRENT_VERSION}</b> y ya está disponible <b>${data.version}</b>.</p>
              <p style="font-size:0.9rem; opacity:0.9;">Actualizá Tuinmo desde Play Store para obtener las últimas mejoras.</p>
            `,
            icon: "info",
            confirmButtonText: "Actualizar ahora",
            confirmButtonColor: "#4AD7B4",
            background: "rgb(86, 23, 164)",
            color: "white",
            allowOutsideClick: false,
            allowEscapeKey: false,
          }).then(() => {
            window.location.href = PLAY_STORE_URL;
          });
        }
      } catch (error) {
        console.warn("No se pudo verificar versión:", error);
      }
    }

    checkVersion();
  }, []);

  return (
    <ThemeProvider theme={themeBreakPoints}>
      <EditorTextContextProvider>
        <BrowserRouter>
          <GlobalAuth>
            <AppRoutes />
          </GlobalAuth>
        </BrowserRouter>
      </EditorTextContextProvider>
    </ThemeProvider>
  );
}

// =====================
// 🔒 Rutas de la app
// =====================
function AppRoutes() {
  const { isLogged, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
        }}
      >
       
      </div>
    );
  }

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/auth" element={<Registro />} />
      <Route path="/login" element={<Login />} />
      <Route path="/recuperar-contrasena" element={<RecoverPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/login-inquilinos" element={<LoginInquilinos />} />
      <Route path="/dashboard-inquilinos" element={<DashboardUnificado />} />

      {/* Rutas privadas */}
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Home />} />
        <Route path="users-controls" element={<UsersControl />} />
        <Route path="propiedades" element={<PropiedadesPage />} />
        <Route path="nueva-propiedad" element={<NuevaPropiedad />} />
        <Route path="propiedades/editar/:id" element={<EditarPropiedad />} />
        <Route path="propiedades/asignar-propietario/:id" element={<AsignarPropietario />} />
        <Route path="inquilinos" element={<InquilinosPage />} />
        <Route path="nuevo-inquilino" element={<NuevoInquilino />} />
        <Route path="propietarios" element={<PropietariosPage />} />
        <Route path="nuevo-propietario" element={<NuevoPropietario />} />
        <Route path="prospectos" element={<ProspectosPage />} />
        <Route path="nuevo-prospecto" element={<NuevoProspecto />} />
        <Route path="editar-prospecto/:id" element={<EditarProspecto />} />
        <Route path="contratos" element={<ContratosPage />} />
        <Route path="contratos/crear" element={<CrearContratoPage />} />
        <Route path="nuevo-contrato-form" element={<NuevoContratoForm />} />
        <Route path="recibo" element={<ReciboForm />} />
        <Route path="recibos/:id" element={<ReciboForm />} />
        <Route path="recibos-page/:id" element={<RecibosPage />} />
        <Route path="nuevo-servicio" element={<NuevoServicio />} />
        <Route path="nuevo-recibo" element={<NuevoRecibo />} />
        <Route path="garantes" element={<GarantesPage />} />
        <Route path="nuevo-garante" element={<NuevoGarante />} />
        <Route path="ajustes" element={<UserSettings />} />
        <Route path="ajustes/mercadopago/callback" element={<MercadoPagoCallback />} />
        <Route path="calculadora-de-alquileres" element={<CalculadoraDeAlquileres />} />
        <Route path="calendario" element={<CalendarioPage />} />
        <Route path="presupuestos" element={<PresupuestoPage />} />
        <Route path="contabilidad" element={<ContabilidadPage />} />
        <Route path="contacto" element={<ContactoPage />} />
        <Route path="subscriptions/create-plan" element={<CreateSubscriptionPlan />} />
        <Route path="plantillas" element={<PlantillasPage />} />
      </Route>
    </Routes>
  );
}

export default App;
