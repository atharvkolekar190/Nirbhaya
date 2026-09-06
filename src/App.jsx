import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";
import Landing from "./pages/Landing/Landing";
import Dashboard from "./pages/Dashboard/Dashboard";
import LiveLocation from "./pages/LiveLocation/LiveLocation";
import EmergencyCenter from "./pages/EmergencyCenter/EmergencyCenter";
import EmergencyContacts from "./pages/EmergencyContacts/EmergencyContacts";
import SensorAnalyticsPage from "./pages/SensorAnalytics/SensorAnalytics";
import SafetyHistoryPage from "./pages/SafetyHistory/SafetyHistory";

function Login() {
  return <div>Login Page</div>;
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
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          }
        />

        <Route
          path="/location"
          element={
            <DashboardLayout>
              <LiveLocation />
            </DashboardLayout>
          }
        />

        <Route
          path="/live-location"
          element={
            <DashboardLayout>
              <LiveLocation />
            </DashboardLayout>
          }
        />

        <Route
          path="/emergency"
          element={
            <DashboardLayout>
              <EmergencyCenter />
            </DashboardLayout>
          }
        />

        <Route
          path="/emergency-center"
          element={
            <DashboardLayout>
              <EmergencyCenter />
            </DashboardLayout>
          }
        />

        <Route
          path="/analytics"
          element={
            <DashboardLayout>
              <SensorAnalyticsPage />
            </DashboardLayout>
          }
        />

        <Route
          path="/sensor-analytics"
          element={
            <DashboardLayout>
              <SensorAnalyticsPage />
            </DashboardLayout>
          }
        />

        <Route
          path="/history"
          element={
            <DashboardLayout>
              <SafetyHistoryPage />
            </DashboardLayout>
          }
        />

        <Route
          path="/safety-history"
          element={
            <DashboardLayout>
              <SafetyHistoryPage />
            </DashboardLayout>
          }
        />

        <Route
          path="/contacts"
          element={
            <DashboardLayout>
              <EmergencyContacts />
            </DashboardLayout>
          }
        />

        <Route
          path="/emergency-contacts"
          element={
            <DashboardLayout>
              <EmergencyContacts />
            </DashboardLayout>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;