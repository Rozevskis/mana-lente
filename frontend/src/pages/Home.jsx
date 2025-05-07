import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

function Home() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="home">
      <h1>Welcome to the News Portal!</h1>
      <p>You are logged in successfully.</p>
    </div>
  );
}

export default Home;
