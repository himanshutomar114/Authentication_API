// src/pages/OAuthSuccess.jsx
import React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

export default function OAuthSuccess() {
  const navigate = useNavigate();
  

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("jwt", token); // store token for Google users
     
      window.location.href = "/certificate";
      
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return <Loader />;
}
