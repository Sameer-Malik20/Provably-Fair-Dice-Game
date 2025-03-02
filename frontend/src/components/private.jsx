import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem("token"); // JWT Token ya authentication state check karein

    return isAuthenticated ? children : <Navigate to="/" />;
};

export default PrivateRoute;
