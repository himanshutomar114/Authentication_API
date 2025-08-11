import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import useAuthUser from "./hooks/useAuthUser";

import Register from "./pages/Register";
import Login from "./pages/Login";
import ProfilePage from "./pages/ProfilePage";
import HomePage from "./pages/HomePage";
import CertificatePage from "./pages/CertificatePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ContactPage from "./pages/ContactPage";

const App = () => {
  const { isLoading, authUser } = useAuthUser();

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />

      <Route
        path="/register"
        element={
          !isAuthenticated ? (
            <Register />
          ) : (
            <Navigate to={isOnboarded ? "/home" : "/profile"} />
          )
        }
      />

      <Route
        path="/login"
        element={
          !isAuthenticated ? (
            <Login />
          ) : (
            <Navigate to={isOnboarded ? "/home" : "/profile"} />
          )
        }
      />

      <Route
        path="/profile"
        element={
          isAuthenticated ? <ProfilePage /> : <Navigate to="/login" replace />
        }
      />
      
      <Route path="/oauth-success" element={<OAuthSuccess />} />
      
      <Route path="/home" element={<HomePage />} />


      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    
     <Route path="/reset-password/:token" element={<ResetPasswordPage />} />


 
      

    </Routes>
  );
};

export default App;
