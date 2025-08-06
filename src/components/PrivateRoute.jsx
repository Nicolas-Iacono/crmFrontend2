import { Navigate } from "react-router-dom";
import { useAuth } from "../components/context/GlobalAuth"

const PrivateRoute = ({ children }) => {
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
    
    return isLogged ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
