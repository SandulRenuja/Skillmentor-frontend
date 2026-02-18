import { Route, Routes } from "react-router";
import Layout from "./components/Layout";
import DashboardPage from "./Pages/DashboardPage";
import SessionsPage from "./Pages/SessionsPage";
import LoginPage from "./Pages/LoginPage";
import HomePAge from "./Pages/HomePage";
import { SignedIn, SignedOut } from "@clerk/clerk-react";


function App() {
  return(
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePAge />} />
          <Route path="/dashboard" element={
            <>
            <SignedIn>
              <DashboardPage />
            </SignedIn>
            <SignedOut>
              <h1>Please sign in to access the dashboard.</h1>
            </SignedOut >
            </>
          } />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sessions" element={<SessionsPage/>} />
          <Route path="/sessions/:sessionId/details/:sessionTitle" element={<SessionsPage/>} />
          </Route>

     
          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
  );
}
export default App;