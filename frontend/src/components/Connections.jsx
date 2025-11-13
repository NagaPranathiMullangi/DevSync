import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../utils/conectionSlice";
import { Link } from "react-router-dom";

const Connections = () => {
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();

  const fetchConnections = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/connections", {
        withCredentials: true,
      });
      dispatch(addConnections(res.data.data));
    } catch (err) {
      console.error("Error fetching connections:", err);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  if (!connections) return null;

  if (connections.length === 0)
    return (
      <div className="flex justify-center items-center h-screen">
        <h1 className="text-3xl font-bold text-gray-500">
          No Connections Found 😕
        </h1>
      </div>
    );

  return (
    <div className="text-center my-8 px-4">
      <h1 className="text-bold text-black text-2xl mb-7">Connections</h1>

      <div className="space-y-5 max-w-2xl mx-auto">
        {connections.map((connection) => {
          const { _id, firstName, lastName, photoUrl, age, gender, about } =
            connection;

          return (
            <div
              key={_id}
              className="flex items-center justify-between p-4 bg-[#D9CFC7] rounded-lg shadow-md hover:shadow-lg transition-all w-full"
            >
              {/* Left section: Image and details */}
              <div className="flex items-center">
                <img
                  alt="profile"
                  className="w-14 h-14 rounded-full object-cover"
                  src={
                    photoUrl
                      ? photoUrl.startsWith("http")
                        ? photoUrl
                        : `${BASE_URL}${photoUrl}`
                      : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                />
                <div className="ml-5 text-left"> {/* 👈 reduced margin from mx-7 → ml-3 */}
                  <h2 className="font-bold text-lg text-black-500 leading-tight">
                    {firstName + " " + lastName}
                  </h2>
                  {age && gender && (
                    <p className="text-sm text-black leading-snug">
                      {age + ", " + gender}
                    </p>
                  )}
                  <p className="text-sm text-black leading-snug">{about}</p>
                </div>
              </div>

              {/* Right section: Button */}
              <div>
                <Link to={"/chat/" + _id}>
                  <button   className="flex items-center gap-2 sm:gap-3 bg-[#B77466] text-white font-semibold py-1.5 sm:py-2 px-4 sm:px-5 rounded-full shadow-md hover:scale-95 transition-transform duration-200 border-none disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base">Chat</button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Connections;
