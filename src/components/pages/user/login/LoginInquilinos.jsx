import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  TextField,
  Link,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Stack,
  Divider,
} from "@mui/material";
// ✅ recomendado en MUI v5:


import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field } from "formik";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";

import PasswordTextField from "../../../common/PasswordTextField";
import axios from "axios";
import Swal from "sweetalert2";
import logoinmoListopng from "../../../../assets/logotipoblanco.png";
import { useAuth } from "../../../context/GlobalAuth";
import { jwtDecode } from "jwt-decode";
import { loginPropietario } from "../../../api/propietarioApi";

/* ------------------------------ UX: teclado “nivel dios” ------------------------------ */
function useKeyboardMetrics() {
  const [state, setState] = useState({ open: false, height: 0 });

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      // keyboard height estimada (funciona muy bien en mobile)
      const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setState({ open: kb > 80, height: kb }); // umbral para evitar falsos positivos
    };

    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    update();

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return state;
}

/* ------------------------------ estilos ------------------------------ */
const Root = styled(Box)(({ theme }) => ({
  minHeight: "100dvh",
  width: "100%",
  position: "relative",
  overflow: "hidden",
  background: "#fff",
  // scroll “suave” en mobile cuando teclado aparece
  WebkitOverflowScrolling: "touch",
}));

const ScrollArea = styled(Box)(({ theme }) => ({
  position: "relative",
  minHeight: "100dvh",
  width: "100%",
  overflowY: "auto",
  overscrollBehavior: "contain",
}));

const HeaderWave = styled(Box)(({ theme }) => ({
  position: "absolute",
  inset: "0 0 auto 0",
  height: 400,
  zIndex: 0,
  pointerEvents: "none",
}));

const BackButton = styled(Box)(({ theme }) => ({
  position: "sticky",
  top: 0,
  zIndex: 10,
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: theme.spacing(2, 2),
  color: "white",
}));

const LogoBlock = styled(Box)(({ theme }) => ({
  width: "100%",
  display: "flex",
  justifyContent: "center",
  position: "relative",
  zIndex: 1,
  paddingTop: theme.spacing(3),
}));

const Logo = styled(Box)(({ theme }) => ({
  width: "min(350px, 70vw)",
  height: 140,
  backgroundImage: `url(${logoinmoListopng})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.15))",
}));

const CenterWrap = styled(Box)(({ theme }) => ({
  position: "relative",
  zIndex: 2,
  width: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(2, 0, 2),
  marginTop: theme.spacing(7),
}));

const AuthCard = styled(Card)(({ theme }) => ({
  width: "min(620px, 92vw)",
  borderRadius: 22,
  boxShadow: "0 18px 50px rgba(17, 24, 39, 0.16)",
  background: "rgba(255,255,255,0.96)",
  backdropFilter: "blur(10px)",
  margin:"0 auto"
}));

const InputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 14,
    backgroundColor: "white",
  },
};

const PrimaryButtonSx = {
  borderRadius: 999,
  height: 48,
  textTransform: "none",
  fontSize: "1rem",
  background: "linear-gradient(90deg, rgba(119, 90, 224, 1) 0%, rgba(99, 67, 173, 1) 100%)",
  boxShadow: "0 10px 26px rgba(108,62,255,0.30)",
  "&:hover": {
    background: "linear-gradient(90deg, rgba(119, 90, 224, 1) 0%, rgba(99, 67, 173, 1) 100%)",
    boxShadow: "0 14px 34px rgba(108,62,255,0.35)",
  },
};

const SecondaryButtonSx = {
  borderRadius: 999,
  height: 48,
  textTransform: "none",
  fontSize: "1rem",
  background: "linear-gradient(90deg, rgba(119, 90, 224, 1) 0%, rgba(99, 67, 173, 1) 100%)",
  boxShadow: "0 10px 26px rgba(108,62,255,0.30)",
  "&:hover": {
    background: "linear-gradient(90deg, rgba(119, 90, 224, 1) 0%, rgba(99, 67, 173, 1) 100%)",
    boxShadow: "0 14px 34px rgba(108,62,255,0.35)",
  },
};

const FooterBar = styled(Box)(({ theme }) => ({
  bottom: 0,
  zIndex: 9,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: 56,
  
}));

/* ------------------------------ componente ------------------------------ */
const LoginInquilinos = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { login } = useAuth();

  const scrollRef = useRef(null);
  const { open: keyboardOpen, height: keyboardHeight } = useKeyboardMetrics();

  const [register, setRegister] = useState(false);
  const [loginType, setLoginType] = useState(null); // 'inquilino' | 'propietario'
  const [user, setUser] = useState(null);

  const API = "https://crminmobiliario-app-production.up.railway.app/api";

  const volverAlLogin = useCallback(() => {
    if (loginType || register) {
      setLoginType(null);
      setRegister(false);
    } else {
      navigate("/login");
    }
  }, [loginType, register, navigate]);

  // ✅ si registerPush existe en tu proyecto, lo usa; si no, no rompe
  useEffect(() => {
    if (
      user &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      typeof window.registerPush === "function"
    ) {
      window.registerPush(user.id);
    }
  }, [user]);

  // Cuando foco un input, lo centra (mobile friendly)
  const handleFocusScroll = useCallback((e) => {
    const el = e?.target;
    if (!el) return;
    setTimeout(() => {
      try {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch {}
    }, 50);
  }, []);

  const toggleLinkSx = useMemo(
    () => ({
      cursor: "pointer",
      fontWeight: 700,
      color: register ? "white" : "rgb(86, 23, 164)",
      "&:hover": { textDecoration: "underline" },
    }),
    [register]
  );

  const showToast = (title) => {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      background: "rgb(86, 23, 164)",
      color: "white",
      customClass: { popup: "swal2-smaller-toast" },
    });
  };

  const showError = (title, text) => {
    Swal.fire({
      icon: "error",
      title,
      text,
      background: "rgb(86, 23, 164)",
      color: "white",
      confirmButtonColor: "#d33",
    });
  };

  const showSuccessModal = async () => {
    await Swal.fire({
      icon: "success",
      title: "¡Registro exitoso!",
      text: "Se ha enviado un email de confirmación. Verificá tu cuenta antes de iniciar sesión.",
      background: "rgb(86, 23, 164)",
      color: "white",
      confirmButtonColor: "rgb(54, 154, 159)",
      confirmButtonText: "Entendido",
    });
  };

  const initialLogin = useMemo(() => ({ email: "", password: "" }), []);
  const initialRegister = useMemo(
    () => ({ nombre: "", apellido: "", dni: "", email: "", password: "" }),
    []
  );

  const resolveRegisterEndpoint = () =>
    loginType === "propietario" ? `${API}/propietario/register` : `${API}/inquilino/register`;

  const resolveLoginEndpoint = () =>
    loginType === "propietario" ? `${API}/propietario/login` : `${API}/inquilino/login`;

  const onSubmitRegister = async (values, { setSubmitting, resetForm }) => {
    try {
      await axios.post(resolveRegisterEndpoint(), values);
      await showSuccessModal();
      resetForm();
      setRegister(false);
    } catch (error) {
      console.error("Error registro:", error);
      let msg = loginType === "propietario" ? "Error al registrar el propietario" : "Error al registrar el inquilino";
      if (error.response?.data?.message) msg = error.response.data.message;
      else if (error.response?.status === 400) msg = "Datos inválidos. Verificá la info ingresada.";
      else if (error.response?.status === 409) msg = "Ya existe un usuario registrado con este email o DNI.";
      showError("Error al registrarse", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmitLogin = async (values, { setSubmitting }) => {
    try {
      let response;

      if (loginType === "propietario") {
        // tu helper ya devuelve algo tipo {jwt, username, logo, ...} (lo envolvemos como axios)
        const r = await loginPropietario({ email: values.email, password: values.password });
        response = { data: r };
      } else {
        const r = await fetch(resolveLoginEndpoint(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'omit',
          body: JSON.stringify({
            email: values.email,
            password: values.password,
          }),
        });

        if (!r.ok) {
          let detail = null;
          try {
            detail = await r.json();
          } catch (_) {
            try {
              detail = await r.text();
            } catch (_) {}
          }
          const err = new Error('Login failed');
          err.response = { status: r.status, data: detail };
          throw err;
        }

        const data = await r.json();
        response = { data };
      }

      if (response?.data?.jwt) {
        // (Opcional) decodificar si querés usar roles
        try {
          jwtDecode(response.data.jwt);
        } catch {}

        login(response.data.jwt, response.data.username, response.data.logo);

        if (loginType === "propietario") {
          localStorage.setItem("propietario_token", response.data.jwt);
          localStorage.setItem("propietario_username", response.data.username);
        } else {
          localStorage.setItem("inquilino_token", response.data.jwt);
          localStorage.setItem("inquilino_username", response.data.username);
        }

        setUser({ id: response.data.userId || response.data.id, username: response.data.username });

        const txt = loginType === "propietario" ? "Propietario" : "Inquilino";
        showToast(`¡Bienvenido ${txt}!`);

        setTimeout(() => navigate("/dashboard-inquilinos"), 80);
      } else {
        showError("Error al iniciar sesión", "Respuesta inválida del servidor.");
      }
    } catch (error) {
      console.error("Error login:", error);
      console.error("[LoginInquilinos] error.response:", error?.response);
      console.error("[LoginInquilinos] error.response.data:", error?.response?.data);
      let msg = "Credenciales incorrectas";
      if (error.response?.data?.message) msg = error.response.data.message;
      else if (typeof error.response?.data === 'string' && error.response.data.trim()) msg = error.response.data;
      else if (error.response?.status === 401) msg = "Email o contraseña incorrectos";
      else if (error.response?.status === 404) msg = "Usuario no encontrado";
      showError("Error al iniciar sesión", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const footerBg = register ? "rgb(86, 23, 164)" : "rgba(255,255,255,0.86)";

  return (
    <Root>
      {/* Fondo */}
      <HeaderWave>
        <svg viewBox="0 0 1440 240" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="loginWaveGradInquilinos" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(117,104,218)" />
              <stop offset="100%" stopColor="rgb(86,23,164)" />
            </linearGradient>
          </defs>
          <path
            d="M0,0 L0,120 C 320,200 520,60 760,120 C 980,170 1200,120 1440,120 L1440,0 Z"
            fill="url(#loginWaveGradInquilinos)"
          />
        </svg>
      </HeaderWave>

      <ScrollArea
        ref={scrollRef}
        sx={{
          // ✅ clave: deja espacio real cuando aparece teclado
          paddingBottom: `${keyboardHeight}px`,
        }}
      >
        {/* Header sticky con volver */}
        <BackButton>
          <Box
            onClick={volverAlLogin}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: 0.75,
              borderRadius: 2,
              cursor: "pointer",
              backgroundColor: "rgba(255,255,255,0.10)",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.16)" },
            }}
          >
            <IconButton size="small" sx={{ color: "white", p: 0.25 }}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2" sx={{ color: "white", fontWeight: 600 }}>
              {loginType || register ? "Volver" : "Inicio"}
            </Typography>
          </Box>
        </BackButton>

        {/* Logo */}
        <LogoBlock sx={{ margin: "0 auto" }}>
          <Logo sx={{marginTop:"-3rem" }}/>
        </LogoBlock>

        {/* Contenido */}
        <CenterWrap>
          <AuthCard>
            <CardContent sx={{ p: { xs: 2.25, sm: 3, margin: "0 auto" } }}>
              {!loginType && !register ? (
                <Stack spacing={2.25}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: "rgba(30, 27, 36, 0.92)" }}>
                      Portal de alquileres
                    </Typography>
                    <Typography variant="body2" sx={{ color: "rgba(60, 60, 72, 0.75)", mt: 0.5 }}>
                      Elegí cómo querés ingresar.
                    </Typography>
                  </Box>

                  <Stack spacing={1.5}>
                    <Button
                      onClick={() => setLoginType("inquilino")}
                      startIcon={<PersonIcon />}
                      variant="contained"
                      sx={PrimaryButtonSx}
                      fullWidth
                    >
                      Ingresar como Inquilino
                    </Button>

                    <Button
                      onClick={() => setLoginType("propietario")}
                      startIcon={<BusinessIcon />}
                      variant="contained"
                      sx={SecondaryButtonSx}
                      fullWidth
                    >
                      Ingresar como Propietario
                    </Button>
                  </Stack>

                  <Divider sx={{ opacity: 0.35 }} />

                  <Typography variant="caption" sx={{ color: "rgba(60,60,72,0.68)" }}>
                    Consejo: si estás en móvil, el formulario se ajusta automáticamente cuando aparece el teclado.
                  </Typography>
                </Stack>
              ) : register ? (
                <Stack spacing={2.25}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: "rgba(30, 27, 36, 0.92)" }}>
                      {loginType === "propietario" ? "Registro de Propietarios" : "Registro de Inquilinos"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "rgba(60, 60, 72, 0.75)", mt: 0.5 }}>
                      Completá tus datos para crear la cuenta.
                    </Typography>
                  </Box>

                  <Formik initialValues={initialRegister} onSubmit={onSubmitRegister}>
                    {({ values, handleChange, handleBlur, isSubmitting }) => (
                      <Form>
                        <Stack spacing={1.5}>
                          <Field
                            name="nombre"
                            as={TextField}
                            label="Nombre"
                            fullWidth
                            required
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onFocus={handleFocusScroll}
                            value={values.nombre}
                            sx={InputSx}
                            autoComplete="given-name"
                          />

                          <Field
                            name="apellido"
                            as={TextField}
                            label="Apellido"
                            fullWidth
                            required
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onFocus={handleFocusScroll}
                            value={values.apellido}
                            sx={InputSx}
                            autoComplete="family-name"
                          />

                          <Field
                            name="dni"
                            as={TextField}
                            label="DNI"
                            fullWidth
                            required
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onFocus={handleFocusScroll}
                            value={values.dni}
                            sx={InputSx}
                            inputProps={{ inputMode: "numeric" }}
                          />

                          <Field
                            name="email"
                            as={TextField}
                            label="Email"
                            type="email"
                            fullWidth
                            required
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onFocus={handleFocusScroll}
                            value={values.email}
                            sx={InputSx}
                            autoComplete="email"
                          />

                          <Field
                            name="password"
                            as={TextField}
                            label="Contraseña"
                            type="password"
                            fullWidth
                            required
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onFocus={handleFocusScroll}
                            value={values.password}
                            sx={InputSx}
                            autoComplete="new-password"
                          />

                          <Button type="submit" variant="contained" disabled={isSubmitting} sx={PrimaryButtonSx} fullWidth>
                            {isSubmitting ? "Registrando..." : "Registrarse"}
                          </Button>
                        </Stack>
                      </Form>
                    )}
                  </Formik>
                </Stack>
              ) : (
                <Stack spacing={2.25}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: "rgba(30, 27, 36, 0.92)" }}>
                      {loginType === "propietario" ? "Portal de Propietarios" : "Portal de Inquilinos"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "rgba(60, 60, 72, 0.75)", mt: 0.5 }}>
                      Ingresá con tu email y contraseña.
                    </Typography>
                  </Box>

                  <Formik initialValues={initialLogin} onSubmit={onSubmitLogin}>
                    {({ values, handleChange, handleBlur, isSubmitting }) => (
                      <Form>
                        <Stack spacing={1.5}>
                          <Field
                            name="email"
                            as={TextField}
                            label="Email"
                            type="email"
                            fullWidth
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onFocus={handleFocusScroll}
                            value={values.email}
                            sx={InputSx}
                            autoComplete="email"
                          />

                          <PasswordTextField
                            sx={InputSx}
                            handleChange={handleChange}
                            handleBlur={handleBlur}
                            values={values}
                            onFocus={handleFocusScroll}
                            autoComplete="current-password"
                          />

                          <Button type="submit" variant="contained" disabled={isSubmitting} sx={PrimaryButtonSx} fullWidth>
                            {isSubmitting ? "Iniciando..." : "Iniciar Sesión"}
                          </Button>
                        </Stack>
                      </Form>
                    )}
                  </Formik>
                </Stack>
              )}
            </CardContent>
          </AuthCard>
        </CenterWrap>

        {/* Footer: sticky + se esconde con teclado abierto */}
        {(loginType || register) && (
          <FooterBar
            sx={{
              color: register ? "white" : "rgb(86, 23, 164)",
              transform: keyboardOpen ? "translateY(120%)" : "translateY(0)",
              transition: "transform 220ms ease",
              borderTop: register ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(15, 23, 42, 0.08)",
            }}
          >
            <Paper
              elevation={1}
              sx={{
                px: 2,
                py: 1,
                borderRadius: 999,
                backgroundColor: register ? "rgba(255,255,255,0.12)" : "rgba(86, 23, 164, 0.08)",
                border: register ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(86, 23, 164, 0.16)",
                maxWidth: "min(92vw, 620px)",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Para ingresar, solicitá tus credenciales a tu inmobiliaria.
        
              </Typography>
            </Paper>
          </FooterBar>
        )}
      </ScrollArea>
    </Root>
  );
};

export default LoginInquilinos;
