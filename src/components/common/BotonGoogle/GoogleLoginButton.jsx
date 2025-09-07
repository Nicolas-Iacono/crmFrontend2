import GoogleLogo from "../../../assets/logoGoogle.png";
import { Button } from "@mui/material";
import { generateStateToken } from "../../../hooks/outh";

const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID}&redirect_uri=https://primary-production-9170b.up.railway.app/rest/oauth2-credential/callback&response_type=code&scope=openid%20email%20profile&access_type=offline`;

const STATE_TOKEN = generateStateToken();
sessionStorage.setItem("OAUTH_STATE", STATE_TOKEN);

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${
  encodeURIComponent(import.meta.env.VITE_GOOGLE_CLIENT_ID)
}&redirect_uri=${
  encodeURIComponent(`http://${import.meta.env.VITE_API_URL_2}/rest/oauth2-credential/callback`)
}&response_type=code&scope=${encodeURIComponent("openid email profile")}&state=${STATE_TOKEN}`;
console.log(authUrl)

export default function GoogleLoginButton({ onClick, children }) {
  return (
    <Button
      variant="contained"
      size="large"
      endIcon={<img src={GoogleLogo} alt="Google" style={{ width: 32, height: 32 }} />}
      sx={{
        backgroundColor: "white",
        color: "rgb(32, 34, 37)",
        fontSize: { xs: '0.9rem', md: '1rem' },
        fontWeight: 600,
        px: { xs: 3, md: 4 },
        py: { xs: 1, md: 1.5 },
        borderRadius: 3,
        '&:hover': {
          backgroundColor: "#f5f5f5"
        },
      }}
      onClick={onClick}
    >
      {children || 'Vincular con Google'}
    </Button>
  );
}