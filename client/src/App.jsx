import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Profile from "./pages/Profile";
import Attendance from "./pages/Attendance";
import Leave from "./pages/Leave";
import Payroll from "./pages/Payroll";
import HRDashboard from "./pages/HRDashboard";
import EmployeesList from "./pages/EmployeesList";
import EmployeeDetail from "./pages/EmployeeDetail";
import HRAttendance from "./pages/HRAttendance";
import HRLeaveApproval from "./pages/HRLeaveApproval";
import HRPayroll from "./pages/HRPayroll";
import NotFound from "./pages/NotFound";

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "hr" ? "/hr" : "/dashboard"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute allowedRoles={["employee"]} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<EmployeeDashboard />} />
              <Route path="/dashboard/profile" element={<Profile />} />
              <Route path="/dashboard/attendance" element={<Attendance />} />
              <Route path="/dashboard/leave" element={<Leave />} />
              <Route path="/dashboard/payroll" element={<Payroll />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["hr"]} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/hr" element={<HRDashboard />} />
              <Route path="/hr/employees" element={<EmployeesList />} />
              <Route path="/hr/employees/:id" element={<EmployeeDetail />} />
              <Route path="/hr/attendance" element={<HRAttendance />} />
              <Route path="/hr/leave" element={<HRLeaveApproval />} />
              <Route path="/hr/payroll" element={<HRPayroll />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
