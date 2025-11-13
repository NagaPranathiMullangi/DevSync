import { useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";

import { removeUser } from "../utils/userSlice";
import {
  FaUserCircle,
  FaLink,
  FaCrown,
  FaSignOutAlt,
  FaHandshake,
  FaBars,
  FaTimes,
  FaCode,
} from "react-icons/fa";
import { MdRequestPage } from "react-icons/md";

const NavBar = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav
      className="bg-[#D6A99D] text-black shadow-md sticky top-0 z-50 font-['Poppins']"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Left - Brand */}
          <Link
            to="/"
            className="flex items-center gap-2 text-3xl font-bold tracking-wide hover:scale-105 transition-transform duration-300"
          >
            <FaCode className="text-white text-3xl drop-shadow-md" />
            <span className="text-white drop-shadow-md font-['Playfair_Display']">
              DevSync
            </span>
          </Link>

          {/* Right - Large screen menu */}
          {user && (
            <div className="hidden md:flex items-center space-x-6">
              <span className="text-lg font-semibold text-white/90">
                Hi, {user.firstName}
              </span>

              <Link
                to="/profile"
                className="hover:text-gray-200 flex items-center gap-2"
              >
                <FaUserCircle /> Profile
              </Link>
              <Link
                to="/connections"
                className="hover:text-gray-200 flex items-center gap-2"
              >
                <FaHandshake /> Connections
              </Link>
              <Link
                to="/requests"
                className="hover:text-gray-200 flex items-center gap-2"
              >
                <MdRequestPage /> Requests
              </Link>
              <Link
                to="/premium"
                className="hover:text-gray-200 flex items-center gap-2"
              >
                <FaCrown /> Premium
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition"
              >
                <FaSignOutAlt /> Logout
              </button>

              <div className="ml-4 w-10 h-10 rounded-full overflow-hidden border-2 border-white">
              <img
 
  src={
    user?.photoUrl
      ? user?.photoUrl.startsWith("blob:") // 🟢 Temporary preview before saving
        ? user?.photoUrl
        : user?.photoUrl.startsWith("http") // 🟢 Full URL (like Cloudinary or API)
        ? user?.photoUrl
        : `${BASE_URL}${user?.photoUrl}` // 🟢 Relative path from backend (/uploads/...)
      : "https://cdn-icons-png.flaticon.com/512/149/149071.png" // 🔴 Default icon
  }
  alt="user"
  className="w-full h-full object-cover"
/>
              </div>
            </div>
          )}

          {/* Hamburger (Mobile) */}
          {user && (
            <div className="md:hidden flex items-center">
              <button onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? (
                  <FaTimes className="text-2xl text-white" />
                ) : (
                  <FaBars className="text-2xl text-white" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && user && (
        <div className="md:hidden bg-white text-[#5b403a] rounded-b-2xl shadow-lg px-5 pt-3 pb-5 space-y-3 transition-all duration-300">
          <div className="flex items-center space-x-3">
            <img
             src={
              user?.photoUrl
                ? user.photoUrl.startsWith("http")
                  ? user.photoUrl
                  : `${BASE_URL}${user.photoUrl}`
                : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
              alt="user"
              className="w-10 h-10 rounded-full border-2 border-[#D6A99D]"
            />
            <span className="font-semibold text-lg">{user.firstName}</span>
          </div>
          <hr />

          <Link
            to="/profile"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 hover:text-[#D6A99D]"
          >
            <FaUserCircle /> Profile
          </Link>

          <Link
            to="/connections"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 hover:text-[#D6A99D]"
          >
            <FaHandshake /> Connections
          </Link>

          <Link
            to="/requests"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 hover:text-[#D6A99D]"
          >
            <MdRequestPage /> Requests
          </Link>

          <Link
            to="/premium"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 hover:text-[#D6A99D]"
          >
            <FaCrown /> Premium
          </Link>

          <button
            onClick={() => {
              handleLogout();
              setMenuOpen(false);
            }}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
