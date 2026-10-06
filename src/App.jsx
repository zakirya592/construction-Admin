import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AppShell } from "@/components/layout/AppShell";
import { landingSections } from "@/landing/sections";
import { LandingSectionPage } from "@/pages/LandingSectionPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { useOffice } from "@/office";

function RequireAuth({ children }) {
  const { user } = useOffice();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/header" replace />} />
          <Route path="header/new" element={<LandingSectionPage sectionKey="header" mode="add" />} />
          <Route path="projects/new" element={<LandingSectionPage sectionKey="projects" mode="add" />} />
          {landingSections.map((section) => (
            <Route key={section.key} path={section.path.slice(1)} element={<LandingSectionPage sectionKey={section.key} />} />
          ))}
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={2800} closeOnClick pauseOnHover theme="light" />
    </>
  );
}
