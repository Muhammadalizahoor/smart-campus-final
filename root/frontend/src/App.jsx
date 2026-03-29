import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentPortal from "./pages/StudentPortal";
import AdminPortal from "./pages/AdminPortal";
import LiveTracking from "./pages/LiveTracking";

import Occupancy from "./pages/analytics/Occupancy";
import OvercrowdingVisual from "./pages/analytics/OvercrowdingVisual"; 
import StudentComplaints from "./pages/StudentComplaints";
import StudentActivityLog from "./pages/StudentActivityLog";
import { AdminRoutesPage } from "./pages/AdminRoutesPage";
import AdminComplaintsPage from "./pages/admin/AdminComplaintsPage";
import AdminComplaintDetail from "./pages/admin/AdminComplaintDetail";

// ✅ The corrected import for your new file
import SpeedInsights from "./pages/admin/SpeedInsights"; 
// 👇 Adding your new History page import here
import AlertsHistoryAli from "./components/admin/alerthistoryali"; 

import NotificationEmail from "./pages/student/NotificationEmail";
import AdminNotifications from "./pages/AdminNotifications";
import StudentLiveTracking from "./pages/student/StudentLiveTracking";
import ProfileSettings from "./pages/ProfileSettings";
import StdProfileSettings from "./pages/stdProfileSettings";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* STUDENT */}
      <Route path="/student/dashboard" element={<StudentPortal />} />
      <Route path="/student/live-tracking" element={<StudentLiveTracking />}/>
      <Route path="/student/complaints" element={<StudentComplaints />} />
      <Route path="/student/profile-settings" element={<StdProfileSettings />} />

      {/* ADMIN */}
      <Route path="/admin/dashboard" element={<AdminPortal />} />
      <Route path="/admin/live-tracking" element={<LiveTracking />} />

      {/* ANALYTICS */}
      <Route path="/admin/analytics/occupancy" element={<Occupancy />} />
      <Route path="/admin/analytics/visual" element={<OvercrowdingVisual />} />
      <Route path="/admin/analytics/student" element={<StudentActivityLog />} />
      
      {/* ✅ The active route for the Speed Insights page */}
      <Route path="/admin/analytics/speed" element={<SpeedInsights />} />

      {/* ✅ ADDED: The route for your new history page */}
      <Route path="/admin/alerts-history" element={<AlertsHistoryAli />} />

      {/* OTHER */}
      <Route path="/admin/routes" element={<AdminRoutesPage />} />
      <Route path="/admin/complaints" element={<AdminComplaintsPage />} />
      <Route path="/admin/complaints/:id" element={<AdminComplaintDetail />} />
      <Route path="/admin/notifications" element={<AdminNotifications />} />
      <Route path="/profile-settings" element={<ProfileSettings />} />
      <Route path="/student/notification-email" element={<NotificationEmail />} />

      <Route path="*" element={<Login />} />
    </Routes>
  );
}

export default App;