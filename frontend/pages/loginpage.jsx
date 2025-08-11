import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import useLogin from "../hooks/useLogin";
import { useNavigate } from 'react-router-dom';

const Login = () => {
   const[loginData,setLoginData] = useState({
    email: "",
    password: "",
   })

   const navigate = useNavigate();

   const { isPending, error, loginMutation } = useLogin();
   const [showPassword, setShowPassword] = useState(false);
   const [isLoading, setIsLoading] = useState(false);

   const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };


const handleLogin = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const response = await loginMutation(loginData);

    // Save the token to localStorage (adjust according to your response shape)
    if (response && response.token) {
      localStorage.setItem("jwt", response.token);

      navigate('/certificate');
    }
  } catch (err) {
    console.error("Login failed:", err);
  } finally {
    setIsLoading(false);
  }
};

     

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-purple-500 mb-2">Welcome Back!</h1>
            <p className="text-gray-400">Sign in to your account</p>
          </div>

         {/* Error */}
          {error && (
            <div className="rounded-md p-2 w-52 alert alert-error mb-4 text-red-500">
              <span>{ error.response.data.message}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3">
           
            {/* Email */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300 block">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full pl-11 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 backdrop-blur-sm"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300 block">Password</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={loginData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 backdrop-blur-sm"
                  required
                />
                
               
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>

              </div>

               <a 
                  href="/forgot-password" 
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium"
                >
                  Forgot Password?
                </a>
            </div>

           
            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Logging In...
                </div>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-white/10"></div>
            <span className="px-4 text-gray-400 text-sm">or</span>
            <div className="flex-1 border-t border-white/10"></div>
          </div>

          {/* Google Login (Redirect with Passport) */}
         <button
  onClick={() => {
    const backendURL =
      import.meta.env.MODE === "development"
        ? "http://localhost:3000"
        : "https://certificate-sender-api.onrender.com";
    window.location.href = `${backendURL}/api/auth/google`;
  }}
  className="w-full bg-white text-black font-medium py-2 px-6 rounded-xl flex items-center justify-center gap-2 hover:scale-105 hover:bg-gray-100 transition-all duration-200 "
>
  <img
    src="https://developers.google.com/identity/images/g-logo.png"
    alt="Google logo"
    className="h-5 w-5"
  />
  Continue with Google
</button>


          {/* Login Link */}
          <div className="text-center mt-5">
            <span className="text-gray-400">Don't have an account? </span>
            <a href="/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
              Sign Up 
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            By logging in, you agree to our{' '}
            <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">Terms of Service</a>{' '}
            and{' '}
            <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login