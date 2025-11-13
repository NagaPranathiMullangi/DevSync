import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useParams, useNavigate } from "react-router-dom";
import { FaHeart, FaUserSlash } from "react-icons/fa";

const IgnoredUsersList = () => {
  const { type } = useParams(); // "byyou" or "you"
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchIgnoredUsers();
  }, [type]);

  const fetchIgnoredUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/premium/ignored-users?type=${type}`, {
        withCredentials: true,
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching ignored users:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update relationship status
  const handleUpdateRelation = async (status, targetUserId) => {
    try {
      await axios.patch(
        `${BASE_URL}/request/update/${status}/${targetUserId}`,
        {},
        { withCredentials: true }
      );
      // Optimistically remove the user from UI
      setUsers(users.filter((u) => u._id !== targetUserId));
    } catch (err) {
      console.error("Error updating relationship:", err);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-[#B77466] text-lg">Loading...</p>
      </div>
    );

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-center text-2xl font-bold text-[#B77466] mb-6">
        {type === "byyou" ? "Users You Ignored" : "Users Who Ignored You"}
      </h1>

      {users.length === 0 ? (
        <p className="text-center text-gray-600 italic">No users found.</p>
      ) : (
        <div className="overflow-x-auto bg-[#D9CFC7] rounded-2xl shadow-md p-4">
          <table className="table w-full">
            <thead>
              <tr className="text-[#3C2A21] text-lg">
                <th>Profile</th>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-[#F3E9E2]">
                  <td>
                    <img
                      src={
                        user.photoUrl ||
                        "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      }
                      alt={user.firstName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </td>
                  <td className="font-semibold text-[#3C2A21]">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="flex gap-2">
                    <button
                      className="btn btn-sm bg-[#B77466] text-white hover:bg-[#B77466]"
                      onClick={() => navigate(`/profile/view/${user._id}`)}
                    >
                      View Profile
                    </button>

                    {type === "byyou" ? (
                      <button
                        className="btn btn-sm bg-[#B77466] text-white hover:scale-95 flex items-center gap-2"
                        onClick={() =>
                          handleUpdateRelation("interested", user._id)
                        }
                      >
                        <FaHeart /> Interested Again
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm bg-[#a78a7f] text-white hover:scale-95 flex items-center gap-2"
                        onClick={() => handleUpdateRelation("ignored", user._id)}
                      >
                        <FaUserSlash /> Ignore Back
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default IgnoredUsersList;
