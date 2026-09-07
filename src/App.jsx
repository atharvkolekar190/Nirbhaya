import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";
import Landing from "./pages/Landing/Landing";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import LiveLocation from "./pages/LiveLocation/LiveLocation";
import EmergencyCenter from "./pages/EmergencyCenter/EmergencyCenter";
import EmergencyContacts from "./pages/EmergencyContacts/EmergencyContacts";
import SensorAnalyticsPage from "./pages/SensorAnalytics/SensorAnalytics";
import SafetyHistoryPage from "./pages/SafetyHistory/SafetyHistory";

function ProtectedRoute({ children }) {
  const location = useLocation();

  if (sessionStorage.getItem("nirbhaya-authenticated") !== "true") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/location"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <LiveLocation />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/live-location"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <LiveLocation />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/emergency"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <EmergencyCenter />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/emergency-center"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <EmergencyCenter />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <SensorAnalyticsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/sensor-analytics"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <SensorAnalyticsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <SafetyHistoryPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/safety-history"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <SafetyHistoryPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/contacts"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <EmergencyContacts />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/emergency-contacts"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <EmergencyContacts />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;