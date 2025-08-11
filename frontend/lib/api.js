//axios - perform HTTP requests like GET , POST , PUT, DELETE 
import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
    const response = await axiosInstance.post("/auth/signup", signupData);
    return response.data;
  }


  export const login = async (loginData) => {
    const response = await axiosInstance.post("/auth/login", loginData);
    return response.data;
  };

  export const logout = async () => {
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
  };

  export const getAuthUser = async () => {
    try {
      const res = await axiosInstance.get("/auth/me");
      localStorage.setItem("user", JSON.stringify(res.data.user));
      return res.data;
    } catch (error) {
      console.log("Error in getAuthUser:", error);
      return null;
    }
  };

 

  export const completeOnboarding = async (userData) => {
    const response = await axiosInstance.post("/auth/onboard", userData);
    return response.data;
  };  

  export const googleLogin = async (userData) => {
  const response = await axiosInstance.post("/auth/google-login", userData);

  if (response.data.token) {
    localStorage.setItem("google_jwt", response.data.token);
  }

  return response.data;
};
 

  export const forgotPassword = async (userData) => {
    const response = await axiosInstance.post("/auth/forgot-password", userData);
    return response.data;
  };

  export const resetPassword = async (token, userData) => {
    const response = await axiosInstance.post(`/auth/reset-password/${token}`, userData);
    return response.data;
  }; 

  

