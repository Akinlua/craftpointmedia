import { Navigate } from "react-router-dom";

const Index = () => {
  // Redirect to login page since this is now a CRM app
  return <Navigate to="/auth/login" replace />;
};

export default Index;