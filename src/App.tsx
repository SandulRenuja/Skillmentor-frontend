import { BrowserRouter, Routes, Route } from "react-router";
import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import PaymentPage from "@/pages/PaymentPage";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import AdminLayout from "./components/Admin/AdminLayout";
import AdminOverviewPage from "./pages/Admin/AdminOverviewPage";
import CreateMentorPage from "./pages/Admin/Creatementorpage";
import CreateSubjectPage from "./pages/Admin/CreateSubjectPage";
import ManageBookingsPage from "./pages/Admin/ManageBookingsPage";

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


           {/* Admin routes — wrapped in AdminLayout (no nav/footer) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverviewPage />} />
          <Route path="mentors" element={<CreateMentorPage />} />
          <Route path="subjects" element={<CreateSubjectPage />} />
          <Route path="bookings" element={<ManageBookingsPage />} />
        </Route>


          <Route path="*" element={<LoginPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
