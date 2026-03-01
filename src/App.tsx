import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import PaymentPage from "@/pages/PaymentPage";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import AdminLayout from "./components/AdminLayout";
import ManageBookingsPage from "./pages/admin/ManageBookingsPage";
import CreateSubjectPage from "./pages/admin/CreateSubjectPage";
import CreateMentorPage from "./pages/admin/CreateMentorPage";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <>
                <SignedIn>
                  <DashboardPage />
                </SignedIn>
                <SignedOut>
                  <LoginPage />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/payment/:sessionId"
            element={
              <>
                <SignedIn>
                  <PaymentPage />
                </SignedIn>
                <SignedOut>
                  <LoginPage />
                </SignedOut>
              </>
            }
          />
          <Route path="*" element={<LoginPage />} />

          //For admin routes
          <Route path="/admin" element={<AdminLayout />}>
           <Route index element={<Navigate to="/admin/bookings" />} />
          <Route path="bookings" element={<ManageBookingsPage />} />
          <Route path="subjects/create" element={<CreateSubjectPage />} />
          <Route path="mentors/create" element={<CreateMentorPage />} />
          </Route>
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
