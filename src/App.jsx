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
import UsersControl from "./components/common/mobile/UsersControl";
import NuevoInterviniente from "./components/pages/pagesForm/NuevoInterviniente.jsx";
import NuevoServicio from "./components/pages/pagesForm/NuevoServicio.jsx"
import NuevoRecibo from "./components/pages/pagesForm/NuevoRecibo.jsx";
import ReciboForm from "./components/pages/pagesForm/ReciboForm.jsx";
import CrearContratoPage from "./components/pages/CrearContratoPage.jsx";

function App() {
  return (
    <EditorTextContextProvider>
      <BrowserRouter>
        <GlobalAuth>
          <Routes>
            <Route path="/auth" element={<Registro/>}/>
            <Route path="/login" element={<Login/>}/>

            <Route element={<Layout />}>
              <Route path="/users-controls" element={<UsersControl />} />
              
              <Route path="/" element={<Home />} />
              <Route path="/propiedades" element={<PropiedadesPage />} />
              <Route path="/nueva-propiedad" element={<NuevaPropiedad />} />

  
              <Route path="/inquilinos" element={<InquilinosPage />} />
              <Route path="/nuevo-inquilino" element={<NuevoInquilino />} />

              <Route path="/propietarios" element={<PropietariosPage />} />
              <Route path="/nuevo-propietario" element={<NuevoPropietario/>} />

              <Route path="/contratos" element={<ContratosPage />} />
              <Route path="/contratos/crear" element={<CrearContratoPage />} />
              <Route path="/nuevo-contrato" element={<NuevoContrato />} />
              
              <Route path="/recibo" element={<ReciboForm />} />
              <Route path="/recibos/:id" element={<ReciboForm />} />

              <Route path="/nuevo-servicio" element={<NuevoServicio />}/>
              <Route path="/nuevo-recibo" element={<NuevoRecibo />}/>              <Route path="/garantes" element={<GarantesPage />} />
              <Route path="/nuevo-garante" element={<NuevoGarante />} />
            </Route>
          </Routes>    
        </GlobalAuth>
      </BrowserRouter>
    </EditorTextContextProvider>
  );
}

export default App;
