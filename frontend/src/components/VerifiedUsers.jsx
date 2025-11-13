import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "../utils/constants";
import { useNavigate } from "react-router-dom";

const VerifiedUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVerifiedUsers();
  }, []);

  const fetchVerifiedUsers = async () => {
    try {
      const res = await axios.get(BASE_URL + "/users/verified-list", {
        withCredentials: true,
      });
      setUsers(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch verified users:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="text-[#B77466] text-lg font-semibold animate-pulse">
          Loading verified users...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#3C2A21] text-center mb-4">
        Verified Users (Not Connected / Not Ignored)
      </h1>

      <div className="flex flex-col gap-4 max-w-lg mx-auto">
        {users.length === 0 ? (
          <p className="text-center text-gray-600">No users available.</p>
        ) : (
          users.map((user) => (
            <div
              key={user._id}
              className="flex justify-between items-center p-4 bg-[#FBF3D5] rounded-xl shadow-md"
            >
              <div>
                <p className="font-semibold">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-gray-600">{user.emailId}</p>
              </div>

              <button
                className="btn bg-[#B77466] text-white hover:scale-95 transition-transform"
                onClick={() => navigate(`/chat/${user._id}`)}
              >
                Chat
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VerifiedUsers;
