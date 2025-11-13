import { Outlet, useNavigate, useLocation } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useEffect } from "react";

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const userData = useSelector((store) => store.user);

  const protectedRoutes = [
    "/feed",
    "/connections",
    "/requests",
    "/profile",
    "/premium",
    "/chat",
    "/ignored",
  ];

  const fetchUser = async () => {
    try {
      const res = await axios.get(BASE_URL + "/profile/view", {
        withCredentials: true,
      });
      dispatch(addUser(res.data));
    } catch (err) {

      // User not logged in
      const isProtected = protectedRoutes.some((route) =>
        location.pathname.startsWith(route)
      );

      if (isProtected) navigate("/login");
    }
  };

  useEffect(() => {
    fetchUser();
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col font-['Poppins']">
      <NavBar />

      <main className="flex-grow bg-[#F9F8F6] text-[#3C2A21] py-10 px-5">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Body;
