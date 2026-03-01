// src/components/AdminLayout.tsx
import { useUser } from "@clerk/clerk-react";
import { Navigate, Outlet } from "react-router";
import { AdminSidebar } from "./AdminSidebar";

export default function AdminLayout() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <div>Loading...</div>;

  // Check the publicMetadata role
  // Also check if 'admin' exists in the metadata regardless of casing
  const userRole = user?.publicMetadata?.role as string;
  const isAdmin = userRole?.toLowerCase() === "ADMIN";

  if (!isAdmin) {
    console.log("Not an admin. Redirecting...");
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}