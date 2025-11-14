export function initGoogleDriveAuth() {
  const tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    scope: "https://www.googleapis.com/auth/drive.file",
    callback: (resp) => {},
  });

  tokenClient.requestAccessToken({ prompt: "" });
}