import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useAuth } from "@/auth/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardPage } from "@/pages/DashboardPage";
import { LoginPage } from "@/pages/LoginPage";
import { ProjectsPage } from "@/pages/ProjectsPage";
function RequireAuth({ children }) {
    const { user } = useAuth();
    if (!user)
        return <Navigate to="/login" replace/>;
    return children;
}
export default function App() {
    return (<>
      <Routes>
        <Route path="/login" element={<LoginPage />}/>
        <Route element={<RequireAuth>
              <AppShell />
            </RequireAuth>}>
          <Route index element={<DashboardPage />}/>
          <Route path="projects" element={<ProjectsPage />}/>
        </Route>
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
      <ToastContainer position="top-right" autoClose={2800} closeOnClick pauseOnHover theme="light"/>
    </>);
}
