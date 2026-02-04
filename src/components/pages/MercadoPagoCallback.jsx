import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const apiRoot = `${import.meta.env.VITE_API_URL}${String(import.meta.env.VITE_API_URL || '').includes('/api') ? '' : '/api'}`;

export default function MercadoPagoCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const ranRef = useRef(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Evita doble ejecución (React StrictMode en dev)
    if (ranRef.current) return;
    ranRef.current = true;

    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    const state = params.get("state");
    const error = params.get("error");
    const errorDescription = params.get("error_description");

    // Si MP mandó error (usuario canceló, etc)
    if (error) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "No se pudo conectar Mercado Pago",
        text: errorDescription || error,
      }).then(() => navigate("/ajustes", { replace: true }));
      return;
    }

    if (!code || !state) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Callback inválido",
        text: "Faltan parámetros de Mercado Pago (code/state).",
      }).then(() => navigate("/ajustes", { replace: true }));
      return;
    }

    // OJO: usá el token del usuario inmobiliaria (admin)
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("propietario_token") ||
      localStorage.getItem("admin_token");

    if (!token) {
      setLoading(false);
      Swal.fire({
        icon: "warning",
        title: "Iniciá sesión",
        text: "Tenés que estar logueado para vincular Mercado Pago.",
      }).then(() => navigate("/login", { replace: true }));
      return;
    }

    (async () => {
      try {
        // Podés usar GET como en tus screenshots
        await axios.get(`${apiRoot}/mercadopago/callback`, {
          params: { code, state },
          headers: { Authorization: `Bearer ${token}` },
        });

        // Limpia la URL para evitar reintentos al refresh
        window.history.replaceState({}, "", "/ajustes");

        await Swal.fire({
          icon: "success",
          title: "Mercado Pago conectado",
          text: "Ya podés cobrar pagos a tu cuenta.",
        });

        navigate("/ajustes", { replace: true });
      } catch (e) {
        const backendMessage =
          e?.response?.data?.detalle ||
          e?.response?.data?.message ||
          e?.response?.data?.error ||
          e?.message ||
          "Error conectando Mercado Pago.";

        Swal.fire({
          icon: "error",
          title: "Error conectando Mercado Pago",
          text: backendMessage,
        }).then(() => navigate("/ajustes", { replace: true }));
      } finally {
        setLoading(false);
      }
    })();
  }, [location.search, navigate]);

  return (
    <div style={{ padding: 24 }}>
      {loading ? (
        <>
          <h2>Conectando Mercado Pago…</h2>
          <p>Un segundo, estamos validando tu cuenta.</p>
        </>
      ) : (
        <p>Redirigiendo…</p>
      )}
    </div>
  );
}
