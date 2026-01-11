import { Outlet } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";

const MainLayout = () => (
  <>
    <AdminNavbar />
    <Outlet />
  </>
);

export default MainLayout;
