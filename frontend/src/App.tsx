import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { api } from "./lib/api";
import { useAuth } from "./store/auth";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Contacts from "./pages/Contacts";
import Companies from "./pages/Companies";
import Deals from "./pages/Deals";
import Tasks from "./pages/Tasks";

function Protected({ children }: { children: JSX.Element }) {
  const user = useAuth((s) => s.user);
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  if (!user) return <BootstrapUser>{children}</BootstrapUser>;
  return children;
}

function BootstrapUser({ children }: { children: JSX.Element }) {
  const setUser = useAuth((s) => s.setUser);
  useEffect(() => {
    api.get("/api/auth/me").then((r) => setUser(r.data)).catch(() => {});
  }, [setUser]);
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<Protected><Layout /></Protected>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/tasks" element={<Tasks />} />
      </Route>
    </Routes>
  );
}
