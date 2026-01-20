export function initGoogleDriveAuth() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const g = globalThis?.google;
  const oauth2 = g?.accounts?.oauth2;

  if (!clientId || !oauth2?.initTokenClient) return;

  const tokenClient = oauth2.initTokenClient({
    client_id: clientId,
    scope: "https://www.googleapis.com/auth/drive.file",
    callback: () => {},
  });

  tokenClient.requestAccessToken({ prompt: "" });
}