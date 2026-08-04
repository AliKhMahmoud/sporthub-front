import { Routes, Route } from "react-router-dom";
import AdminPanel from "./pages/AdminPanel";
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import CoachChats from "./pages/CoachChats";
import Home from "./pages/Home";
import Sports from "./pages/Sports";
import Forum from "./pages/Forum";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SportDetails from "./pages/SportsDetails";
import AiTrainer from "./pages/AITrainer";
import Coaches from "./pages/Coaches";
import Chat from "./pages/Chat";
import MyChats from "./pages/MyChats";
import Dashboard from "./pages/Dashboard";
import DashboardContent from "./pages/DashboardContent";
import DashboardAthletes from "./pages/DashboardAthletes";
import DashboardAiPlans from "./pages/DashboardAiPlans";
import DashboardProgressReviews from "./pages/DashboardProgressReviews";
function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/sports" element={<Sports />} />
        <Route path="/sports/:slug" element={<SportDetails />} />
        <Route path="/forum" element={<Forum />} />
        <Route
  path="/admin"
  element={
    <ProtectedRoute role="admin">
      <AdminPanel />
    </ProtectedRoute>
  }
/>
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ai-trainer"
          element={
            <ProtectedRoute role="athlete">
              <AiTrainer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/coaches"
          element={
            <ProtectedRoute>
              <Coaches />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat/:coachId"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
  path="/my-chats"
  element={
    <ProtectedRoute role="athlete">
      <MyChats />
    </ProtectedRoute>
  }
/>
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute role="coach">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/content" element={<DashboardContent />} />
        <Route path="/dashboard/athletes" element={<DashboardAthletes />} />
        <Route path="/dashboard/ai-plans" element={<DashboardAiPlans />} />
        <Route path="/dashboard/progress-reviews" element={<DashboardProgressReviews />} />
        <Route path="/dashboard/chats" element={<CoachChats />}
/>
      </Route>
    </Routes>
  );
}

export default App;