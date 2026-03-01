import { useUser } from "@clerk/clerk-react";
import { Navigate, Outlet } from "react-router";
import { AdminSidebar } from "./AdminSidebar";


export default function AdminLayout() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <div>Loading...</div>;

  // Check Clerk publicMetadata for the admin role
  if (user?.publicMetadata?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}