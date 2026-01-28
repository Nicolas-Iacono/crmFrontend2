export async function registerPush(userId) {
    try {
      // 1️⃣ Registrar el service worker si aún no está activo
      if (!navigator.serviceWorker.controller) {
        await navigator.serviceWorker.register("/sw.js");
      }
  
      // 2️⃣ Esperar a que el SW esté listo
      const registration = await navigator.serviceWorker.ready;
  
      // 3️⃣ Pedir permiso al usuario
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.warn("🚫 Permiso de notificaciones denegado");
        return;
      }
  
      // 4️⃣ Crear la suscripción
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY
        ),
      });
  
      // 5️⃣ Enviar suscripción al backend
       const token = localStorage.getItem("token");
      if (!token) {
        console.warn("⚠️ Token no encontrado para registrar push");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/notifications/subscribe?userId=${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
           expirationTime: subscription.expirationTime,
            keys: {
              p256dh: subscription.toJSON().keys.p256dh,
              auth: subscription.toJSON().keys.auth,
            },
          }),
        }
      );
  
      if (response.ok) {
        console.log("🎉 Suscripción push registrada correctamente");
      } else {
        console.error("❌ Error al registrar suscripción:", await response.text());
      }
    } catch (err) {
      console.error("⚠️ Error en registerPush:", err);
    }
  }
  
  // Helper para convertir la clave pública VAPID
  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
  }