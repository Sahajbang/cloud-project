import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";

import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

import VideoCallModal from "./components/VideoCallModal";
import useCallStore from "./store/useCallStore";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();
  const { isReceivingCall, initCallSocketListeners } = useCallStore();

  useEffect(() => {
    checkAuth();
    initCallSocketListeners();

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        console.log("Notification permission:", permission);
      });
    }
  }, [checkAuth, initCallSocketListeners]);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div data-theme={theme}>
      <Navbar />

      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>

      {/* ✅ Show VideoCallModal globally if someone is calling */}
      {isReceivingCall && <VideoCallModal />}

      <Toaster />
    </div>
  );
};

export default App;

// ============ Trying VC again =========

// import Navbar from "./components/Navbar";
// import HomePage from "./pages/HomePage";
// import SignUpPage from "./pages/SignUpPage";
// import LoginPage from "./pages/LoginPage";
// import SettingsPage from "./pages/SettingsPage";
// import ProfilePage from "./pages/ProfilePage";

// import { Routes, Route, Navigate } from "react-router-dom";
// import { useAuthStore } from "./store/useAuthStore";
// import { useThemeStore } from "./store/useThemeStore";

// import { useEffect } from "react";
// import { Loader } from "lucide-react";
// import { Toaster } from "react-hot-toast";

// import VideoCallModal from "./components/VideoCallModal";
// import useCallStore from "./store/useCallStore"; // ✅ Using the correct store

// const App = () => {
//   const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
//   const { theme } = useThemeStore();
//   const { isReceivingCall } = useCallStore();

//   useEffect(() => {
//     checkAuth();

//     // ✅ Request Notification Permission
//     if ("Notification" in window && Notification.permission === "default") {
//       Notification.requestPermission().then((permission) => {
//         console.log("Notification permission:", permission);
//       });
//     }
//   }, [checkAuth]);

//   if (isCheckingAuth && !authUser)
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <Loader className="size-10 animate-spin" />
//       </div>
//     );

//   return (
//     <div data-theme={theme}>
//       <Navbar />

//       <Routes>
//         <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
//         <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
//         <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
//         <Route path="/settings" element={<SettingsPage />} />
//         <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
//       </Routes>

//       {isReceivingCall && <VideoCallModal />}

//       <Toaster />
//     </div>
//   );
// };

// export default App;
        

// =============== Before Notifications Update =============

// import Navbar from "./components/Navbar";
// import HomePage from "./pages/HomePage";
// import SignUpPage from "./pages/SignUpPage";
// import LoginPage from "./pages/LoginPage";
// import SettingsPage from "./pages/SettingsPage";
// import ProfilePage from "./pages/ProfilePage";

// import { Routes, Route, Navigate } from "react-router-dom";
// import { useAuthStore } from "./store/useAuthStore";
// import { useThemeStore } from "./store/useThemeStore";
// import { useChatStore } from "./store/useChatStore";

// import { useEffect } from "react";
// import { Loader } from "lucide-react";
// import { Toaster } from "react-hot-toast";

// import VideoCallModal from "./components/VideoCallModal";
// import LiveCall from "./components/LiveCall";

// const App = () => {
//   const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
//   const { theme } = useThemeStore();
//   const { isReceivingCall } = useChatStore(); // Still using useChatStore if modal is based on that

//   useEffect(() => {
//     checkAuth();
//   }, [checkAuth]);

//   if (isCheckingAuth && !authUser)
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <Loader className="size-10 animate-spin" />
//       </div>
//     );

//   return (
//     <div data-theme={theme}>
//       <Navbar />

//       <Routes>
//         <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
//         <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
//         <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
//         <Route path="/settings" element={<SettingsPage />} />
//         <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
//         <Route path="/livecall" element={<LiveCall />} />
//       </Routes>

//       {isReceivingCall && <VideoCallModal />}

//       <Toaster />
//     </div>
//   );
// };

// export default App;



// =================== Before adding socket=======

// import Navbar from "./components/Navbar";
// import HomePage from "./pages/HomePage";
// import SignUpPage from "./pages/SignUpPage";
// import LoginPage from "./pages/LoginPage";
// import SettingsPage from "./pages/SettingsPage";
// import ProfilePage from "./pages/ProfilePage";

// import { Routes, Route, Navigate } from "react-router-dom";
// import { useAuthStore } from "./store/useAuthStore";
// import { useThemeStore } from "./store/useThemeStore";
// import { useChatStore } from "./store/useChatStore"; // <-- Added for chat state
// import { useEffect } from "react";

// import { Loader } from "lucide-react";
// import { Toaster } from "react-hot-toast";

// import VideoCallModal from "./components/VideoCallModal"; // <-- Import for the modal
// import LiveCall from "./components/LiveCall"; // <-- Import for the live call component

// const App = () => {
//   const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
//   const { theme } = useThemeStore();
//   const { isReceivingCall } = useChatStore(); // <-- Call state from chat store

//   useEffect(() => {
//     checkAuth();
//   }, [checkAuth]);

//   if (isCheckingAuth && !authUser)
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <Loader className="size-10 animate-spin" />
//       </div>
//     );

//   return (
//     <div data-theme={theme}>
//       <Navbar />

//       <Routes>
//         <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
//         <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
//         <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
//         <Route path="/settings" element={<SettingsPage />} />
//         <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
//         <Route path="/livecall" element={<LiveCall />} /> {/* <-- Added live call route */}
//       </Routes>

//       {isReceivingCall && <VideoCallModal />} {/* 👈 Conditionally mounted */}

//       <Toaster />
//     </div>
//   );
// };

// export default App;


//=================== App.jsx before Video Call ============================

// import Navbar from "./components/Navbar";
// import HomePage from "./pages/HomePage";
// import SignUpPage from "./pages/SignUpPage";
// import LoginPage from "./pages/LoginPage";
// import SettingsPage from "./pages/SettingsPage";
// import ProfilePage from "./pages/ProfilePage";

// import { Routes, Route, Navigate } from "react-router-dom";
// import { useAuthStore } from "./store/useAuthStore";
// import { useThemeStore } from "./store/useThemeStore";
// import { useChatStore } from "./store/useChatStore"; // <-- Added
// import { useEffect } from "react";

// import { Loader } from "lucide-react";
// import { Toaster } from "react-hot-toast";

// import VideoCallModal from "./components/VideoCallModal"; // <-- Import

// const App = () => {
//   const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
//   const { theme } = useThemeStore();
//   const { isReceivingCall } = useChatStore(); // <-- Call state from chat store

//   useEffect(() => {
//     checkAuth();
//   }, [checkAuth]);

//   if (isCheckingAuth && !authUser)
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <Loader className="size-10 animate-spin" />
//       </div>
//     );

//   return (
//     <div data-theme={theme}>
//       <Navbar />

//       <Routes>
//         <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
//         <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
//         <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
//         <Route path="/settings" element={<SettingsPage />} />
//         <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
//       </Routes>

//       {isReceivingCall && <VideoCallModal />} {/* 👈 Conditionally mounted */}

//       <Toaster />
//     </div>
//   );
// };

// export default App;

// ========= App.jsx before Video Calling ================

// import Navbar from "./components/Navbar";

// import HomePage from "./pages/HomePage";
// import SignUpPage from "./pages/SignUpPage";
// import LoginPage from "./pages/LoginPage";
// import SettingsPage from "./pages/SettingsPage";
// import ProfilePage from "./pages/ProfilePage";

// import { Routes, Route, Navigate } from "react-router-dom";
// import { useAuthStore } from "./store/useAuthStore";
// import { useThemeStore } from "./store/useThemeStore";
// import { useEffect } from "react";

// import { Loader } from "lucide-react";
// import { Toaster } from "react-hot-toast";

// const App = () => {
//   const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
//   const { theme } = useThemeStore();

//   console.log({ onlineUsers });

//   useEffect(() => {
//     checkAuth();
//   }, [checkAuth]);

//   console.log({ authUser });

//   if (isCheckingAuth && !authUser)
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <Loader className="size-10 animate-spin" />
//       </div>
//     );

//   return (
//     <div data-theme={theme}>
//       <Navbar />

//       <Routes>
//         <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
//         <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
//         <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
//         <Route path="/settings" element={<SettingsPage />} />
//         <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
//       </Routes>

//       <Toaster />
//     </div>
//   );
// };
// export default App;
