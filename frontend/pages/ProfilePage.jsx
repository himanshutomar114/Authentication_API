import React, { useState } from 'react';
import useAuthUser from '../hooks/useAuthUser'
import { completeOnboarding } from '../lib/api';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from 'react-router-dom'; 
import { forgotPassword } from '../lib/api';


const ProfilePage = () => {

    const { authUser } = useAuthUser();
    const queryClient = useQueryClient();
    const navigate = useNavigate(); // Add this hook


    const { mutate: onboardingMutation, isPending, error } = useMutation({
        mutationFn: completeOnboarding,
        onSuccess: async (data) => {
          queryClient.invalidateQueries({ queryKey: ["authUser"] });
      
          // update local user state with the new data returned from backend
          setUser((prevUser) => ({
            ...prevUser,
            fullName: editedFullName,
            userName: editedUserName,
            bio: editedBio,
            location: editedLocation,
            email: editedemail,
            photo: selectedFile ? URL.createObjectURL(selectedFile) : prevUser.photo
          }));
        },
        onError: (error) => {
            const errorMessage = error?.response?.data?.message || "Something went wrong.";
            setResetMessage(errorMessage); // show error on screen
            setTimeout(() => setResetMessage(""), 3000);
          }
          
      });
      


  
  

  const [user, setUser] = useState({
    photo: authUser?.profilePic || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOtu74pEiq7ofeQeTsco0migV16zZoBwSlGg&s",
    fullName: authUser?.fullName || "",
    userName: authUser?.userName || "",
    bio: authUser?.bio || "",
    location: authUser?.location || "",
    email: authUser?.email || "",
  });

  const [editMode, setEditMode] = useState(false);
  const [editedFullName, setEditedFullName] = useState(user.fullName);
  const [editedUserName, setEditedUserName] = useState(user.userName);
  const [editedemail, setEditedemail] = useState(user.email);
  const [editedBio, setEditedBio] = useState(user.bio);
  const [editedLocation, setEditedLocation] = useState(user.location);
  const [resetMessage, setResetMessage] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [isHoveringPhoto, setIsHoveringPhoto] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);


  React.useEffect(() => {
    setEditedFullName(user.fullName);
    setEditedUserName(user.userName);
    setEditedemail(user.email);
    setEditedBio(user.bio);
    setEditedLocation(user.location);
  }, [user]);

const handleResetPassword = async () => {
  setIsResetting(true);
  setResetMessage("");

  try {
    await forgotPassword({ email: user.email }); 
    setResetMessage(`A password reset link has been sent to ${user.email}. Please check your inbox.`);
  } catch (error) {
    setResetMessage(error.response?.data?.message || "Failed to send reset link.");
  } finally {
    setIsResetting(false);
  }
};

  const handleSaveChanges = (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append("fullName", editedFullName);
    formData.append("userName", editedUserName);
    formData.append("email", editedemail);
    formData.append("bio", editedBio);
    formData.append("location", editedLocation);
  
    if (selectedFile) {
      formData.append("profilePic", selectedFile);
    } else {
      // Send existing photo URL if no new image is selected
      formData.append("existingProfilePic", user.photo);
    }
  
    setEditMode(false);
    setResetMessage("Profile updated successfully!");
    setTimeout(() => setResetMessage(""), 3000);
  
    onboardingMutation(formData);
  };
  
  

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedFullName(user.fullName);
    setEditedUserName(user.userName);
    setEditedemail(user.email);
    setEditedBio(user.bio);
    setEditedLocation(user.location);
  };
   

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file); // this is required for uploading to backend
  
      const reader = new FileReader();
      reader.onload = (e) => {
        setUser({
          ...user,
          photo: e.target.result, // Optional preview
        });
        setResetMessage("Profile photo updated successfully!");
        setTimeout(() => setResetMessage(""), 3000);
      };
      reader.readAsDataURL(file);
    }
  };
  

   
  const handleLocationDetection = () => {
    if (!navigator.geolocation) {
      setResetMessage('Geolocation is not supported by this browser.');
      setTimeout(() => setResetMessage(''), 3000);
      return;
    }
  
    setIsDetectingLocation(true);
    setResetMessage('');
  
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
            const response = await fetch(`http://localhost:3000/reverse-geocode?lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
  
          const city = data.address.city || data.address.town || data.address.village || '';
          const state = data.address.state || '';
          const country = data.address.country || '';
  
          const detectedLocation = `${city}, ${state}, ${country}`;
  
          if (editMode) {
            setEditedLocation(detectedLocation);
          } else {
            setUser({
              ...user,
              location: detectedLocation
            });
          }
  
          setIsDetectingLocation(false);
          setResetMessage('Location detected successfully!');
          setTimeout(() => setResetMessage(''), 3000);
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          setIsDetectingLocation(false);
          setResetMessage('Failed to detect location. Please try again.');
          setTimeout(() => setResetMessage(''), 3000);
        }
      },
      (error) => {
        setIsDetectingLocation(false);
        let errorMessage = 'Failed to detect location. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location access denied by user.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
            break;
        }
        setResetMessage(errorMessage);
        setTimeout(() => setResetMessage(''), 3000);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

 
  const handleBackToHome = () => {
    navigate('/'); // Navigate to home page - adjust the path as needed
  };
  

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gray-800 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-700 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="relative backdrop-blur-sm bg-gray-900/80 border border-gray-700 p-8 rounded-3xl shadow-2xl w-full max-w-2xl">
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-3xl"></div>
        
        <div className="relative z-10">
          {/* Back to Home Button - Added at the top */}
          <div className="flex justify-start mb-6">
            <button
              onClick={handleBackToHome}
              className="flex items-center bg-gray-800/60 backdrop-blur-sm hover:bg-gray-700/60 text-white py-2 px-4 rounded-xl font-medium border border-gray-600 hover:border-gray-500 transition-all duration-300 transform hover:scale-105 group"
            >
              <svg 
                className="w-5 h-5 mr-2 text-gray-400 group-hover:text-white transition-colors duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </button>
          </div>

          {/* Header with animated gradient text */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black bg-gradient-to-r from-white via-gray-300 to-gray-400 bg-clip-text text-transparent mb-2 tracking-tight">
              User Profile
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-gray-400 to-gray-600 mx-auto rounded-full"></div>
          </div>

          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 mb-12">
            {/* Enhanced User Photo */}
            <div className="flex-shrink-0 relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full blur-lg opacity-40 animate-pulse"></div>
              <div 
                className="relative cursor-pointer group"
                onMouseEnter={() => setIsHoveringPhoto(true)}
                onMouseLeave={() => setIsHoveringPhoto(false)}
              >
                <img
                  src={user.photo}
                  alt={`${user.fullName}'s profile`}
                  className="w-40 h-40 rounded-full object-cover shadow-2xl border-4 border-gray-600 relative z-10 transition-all duration-300 group-hover:brightness-75"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-gray-700/30 to-gray-800/30"></div>
                
                {/* Upload overlay */}
                <div className={`absolute inset-0 rounded-full bg-black/60 flex items-center justify-center transition-all duration-300 z-20 ${isHoveringPhoto ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="text-center">
                    <svg className="w-8 h-8 text-white mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-white text-sm font-semibold">Upload</p>
                  </div>
                </div>
                
                {/* Hidden file input */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                />
              </div>
            </div>

            {/* Enhanced User Info */}
            <div className="text-center lg:text-left flex-grow">
              {editMode ? (
                <div className="space-y-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={editedFullName}
                      onChange={(e) => setEditedFullName(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-gray-800 backdrop-blur-sm text-white border border-gray-600 focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-300 placeholder-gray-400"
                      placeholder="Full Name"
                    />
                  </div>
                  
                  <div className="relative">
                    <div className="flex items-center bg-gray-800 backdrop-blur-sm rounded-2xl border border-gray-600 focus-within:ring-2 focus-within:ring-gray-400 transition-all duration-300">
                      <span className="text-gray-300 pl-4 font-semibold">@</span>
                      <input
                        type="text"
                        value={editedUserName}
                        onChange={(e) => setEditedUserName(e.target.value)}
                        className="w-full p-4 rounded-2xl bg-transparent text-white outline-none placeholder-gray-400"
                        placeholder="UserName"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <div className="flex items-center bg-gray-800 backdrop-blur-sm rounded-2xl border border-gray-600 focus-within:ring-2 focus-within:ring-gray-400 transition-all duration-300">
                      <span className="text-gray-300 pl-4 font-semibold">@</span>
                      <input
                        type="text"
                        value={editedemail}
                        readOnly 
                        onChange={(e) => setEditedemail(e.target.value)}
                        className="w-full p-4 rounded-2xl bg-transparent text-white outline-none placeholder-gray-400"
                        placeholder="Email"
                      />
                    </div>
                  </div>
                  
                  <textarea
                    value={editedBio}
                    onChange={(e) => setEditedBio(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-gray-800 backdrop-blur-sm text-white border border-gray-600 focus:ring-2 focus:ring-gray-400 focus:border-transparent h-32 resize-none transition-all duration-300 placeholder-gray-400"
                    placeholder="Bio"
                  ></textarea>
                  
                  <div className="flex items-center bg-gray-800 backdrop-blur-sm rounded-2xl border border-gray-600 focus-within:ring-2 focus-within:ring-gray-400 transition-all duration-300">
                    <button
                      onClick={handleLocationDetection}
                      disabled={isDetectingLocation}
                      className="ml-4 mr-2 p-1 rounded-full hover:bg-gray-700 transition-all duration-200 disabled:cursor-not-allowed"
                      title="Detect current location"
                    >
                      {isDetectingLocation ? (
                        <svg className="w-5 h-5 text-gray-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400 hover:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path>
                        </svg>
                      )}
                    </button>
                    <input
                      type="text"
                      value={editedLocation}
                      onChange={(e) => setEditedLocation(e.target.value)}
                      className="w-full p-4 rounded-r-2xl bg-transparent text-white outline-none placeholder-gray-400"
                      placeholder="Location"
                    />
                  </div>
                  
                  <div className="flex justify-center gap-4 mt-8">
                    <button
                      onClick={handleSaveChanges}
                      className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white py-3 px-8 rounded-2xl font-bold shadow-xl hover:shadow-gray-700/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-800/60 backdrop-blur-sm hover:bg-gray-700/60 text-white py-3 px-8 rounded-2xl font-bold border border-gray-600 hover:border-gray-500 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">{user.fullName}</h2>
                  <p className="text-2xl text-gray-300 font-semibold mb-4">@{user.userName}</p>
                  <p className="text-2xl text-gray-300 font-semibold mb-4">@{user.email}</p>
                  <p className="text-gray-300 text-lg leading-relaxed max-w-md">{user.bio}</p>
                  
                  <div className="flex items-center justify-center lg:justify-start text-gray-300 mt-6">
                    <div className="flex items-center bg-gray-800/60 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-600">
                      <svg className="w-5 h-5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path>
                      </svg>
                      <span className="font-medium">{user.location}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setEditMode(true)}
                    className="mt-8 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 px-8 rounded-2xl font-bold shadow-xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Elegant Separator */}
          <div className="relative my-12">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center">
              <div className="bg-gradient-to-r from-purple-500 to-cyan-500 w-16 h-1 rounded-full"></div>
            </div>
          </div>

          {/* Enhanced Account Settings */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl shadow-xl">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Account Settings
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <p className="text-xl text-white font-semibold mb-2">Password Security</p>
                <p className="text-gray-300">Keep your account secure with regular password updates</p>
              </div>
              
              <button
                onClick={handleResetPassword}
                className="relative bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-4 px-8 rounded-2xl font-bold shadow-xl hover:shadow-indigo-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center min-w-48"
                disabled={isResetting}
              >
                {isResetting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v2H3a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2v-8a2 2 0 00-2-2h-3V6a4 4 0 00-4-4zm-2 6V6a2 2 0 114 0v2H8zm5-2v2H7V6a3 3 0 016 0z" clipRule="evenodd"></path>
                    </svg>
                    Reset Password
                  </div>
                )}
              </button>
            </div>

            {resetMessage && (
              <div className="mt-8 relative">
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 text-green-300 p-6 rounded-2xl text-center font-medium shadow-xl animate-fade-in">
                  <div className="flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    Success!
                  </div>
                  {resetMessage}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;