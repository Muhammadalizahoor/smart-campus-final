import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getValidUser } from "./utils/session";
import { useAuth } from "./contexts/AuthContext";

export default function AppWrapper({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      const user = getValidUser();

      if (!user && location.pathname !== "/") {
        logout();           
        navigate("/", { replace: true }); // redirect to login
      }
    }, 1000); // check every 1 second

    return () => clearInterval(interval);
  }, [navigate, location.pathname, logout]);

  return children;
}
