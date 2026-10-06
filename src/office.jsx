import { createContext, useContext, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { createOffice } from "@/data";
import newRequest, { getSession, saveSession } from "@/utils/userRequest";

const OfficeContext = createContext(null);

function messageFromApi(error, fallback) {
  const data = error?.response?.data;
  const details = Array.isArray(data?.errors) ? data.errors.map((item) => item.message).filter(Boolean) : [];
  if (details.length) return details.join(". ");
  return data?.message || error?.message || fallback;
}

function sessionFromLogin(payload) {
  const profile = payload?.user;
  if (!profile || !payload?.token) throw new Error("Sign in failed");
  return {
    id: profile._id,
    name: profile.name,
    email: profile.email,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    token: payload.token,
  };
}

export function OfficeProvider({ children }) {
  const [user, setUser] = useState(() => getSession());
  const [office, setOffice] = useState(createOffice);

  const value = useMemo(
    () => ({
      user,
      office,
      async login(email, password) {
        const trimmed = email.trim();
        try {
          const response = await newRequest.post("/api/auth/login", {
            email: trimmed,
            password,
          });
          const body = response.data;
          if (!body?.status) throw new Error(body?.message || "Sign in failed");
          const session = sessionFromLogin(body.data);
          saveSession(session);
          setUser(session);
          return body.message;
        } catch (error) {
          throw new Error(messageFromApi(error, "Sign in failed"));
        }
      },
      async register(name, email, password) {
        try {
          const response = await newRequest.post("/api/auth/register", {
            name: name.trim(),
            email: email.trim(),
            password,
          });
          const body = response.data;
          if (!body?.status) throw new Error(body?.message || "Registration failed");
          if (body.data?.user && body.data?.token) {
            const session = sessionFromLogin(body.data);
            saveSession(session);
            setUser(session);
            return { message: body.message, signedIn: true };
          }
          return { message: body.message || "Account created", signedIn: false };
        } catch (error) {
          throw new Error(messageFromApi(error, "Registration failed"));
        }
      },
      logout() {
        saveSession(null);
        setUser(null);
      },
      restore() {
        setOffice(createOffice());
        toast.success("Sample office restored");
      },
      saveProject(input) {
        if (!String(input.name ?? "").trim()) {
          toast.error("Add a project name first");
          return false;
        }
        setOffice((current) => {
          if (input.id) {
            return {
              ...current,
              projects: current.projects.map((project) => (project.id === input.id ? { ...project, ...input } : project)),
            };
          }
          return {
            ...current,
            projects: [{ ...input, id: crypto.randomUUID() }, ...current.projects],
          };
        });
        toast.success(input.id ? "Project updated" : "Project added");
        return true;
      },
      deleteProject(id) {
        setOffice((current) => ({
          ...current,
          projects: current.projects.filter((project) => project.id !== id),
        }));
        toast.success("Project removed");
      },
    }),
    [user, office],
  );

  return <OfficeContext.Provider value={value}>{children}</OfficeContext.Provider>;
}

export function useOffice() {
  const value = useContext(OfficeContext);
  if (!value) throw new Error("Office data is missing");
  return value;
}
