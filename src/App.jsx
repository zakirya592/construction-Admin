import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AppShell } from "@/components/layout/AppShell";
import { findSection, landingSections } from "@/landing/sections";
import { LandingSectionPage } from "@/pages/LandingSectionPage";
import { AddSectionPage } from "@/pages/AddSectionPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { useOffice } from "@/office";

function RequireAuth({ children }) {
  const { user } = useOffice();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function SectionAddRoute() {
  const { sectionKey } = useParams();
  const section = findSection(sectionKey);
  if (!section) return <Navigate to="/sections/new" replace />;
  return <LandingSectionPage sectionKey={section.key} mode="add" />;
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
          <Route path="sections/new" element={<AddSectionPage />} />
          <Route path=":sectionKey/new" element={<SectionAddRoute />} />
          <Route path="header/edit" element={<LandingSectionPage sectionKey="header" mode="edit" />} />
          <Route path="projects/edit" element={<LandingSectionPage sectionKey="projects" mode="edit" />} />
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
