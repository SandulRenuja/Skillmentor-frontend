import { Route, Routes } from "react-router";
import Layout from "./components/Layout";
import HomePage from "./Pages/HomePAge";
import DashboardPage from "./Pages/DashboardPage";
import LoginPage from "./Pages/LoginPAge";

function App() {
  return(
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          </Route>

     
          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
  );
}
export default App;