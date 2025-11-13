import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addRequests, removeRequest } from "../utils/requestSlice";
import { useEffect } from "react";

const Requests = () => {
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();

  const reviewRequest = async (status, _id) => {
    try {
      await axios.post(
        BASE_URL + "/request/review/" + status + "/" + _id,
        {},
        { withCredentials: true }
      );
      dispatch(removeRequest(_id));
    } catch (err) {
      console.error("Error reviewing request:", err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/requests/received", {
        withCredentials: true,
      });
      dispatch(addRequests(res.data.data));
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (!requests) return null;

  if (requests.length === 0)
    return (
      <div className="flex justify-center items-center h-screen">
        <h1 className="text-3xl font-bold text-gray-500">
          No Requests Found 😕
        </h1>
      </div>
    );

  return (
    <div className="text-center my-8 px-6">
      <h1 className="text-bold text-black text-2xl mb-7">
        Connection Requests
      </h1>

      <div className="space-y-6 max-w-3xl mx-auto">
        {requests.map((request) => {
          const { _id, firstName, lastName, photoUrl, age, gender, about } =
            request.fromUserId;

          return (
            <div
              key={_id}
              className="flex items-center justify-between p-4 bg-[#D9CFC7] rounded-lg shadow-md hover:shadow-lg transition w-full"
            >
              {/* Left section: Image and details */}
              <div className="flex items-center gap-4">
                <img
                  alt="profile"
                  className="w-16 h-16 rounded-full object-cover"
                  src={
                    photoUrl
                      ? photoUrl.startsWith("http")
                        ? photoUrl
                        : `${BASE_URL}${photoUrl}`
                      : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                />
                <div className=" mx-7 text-left">
                  <h2 className="font-bold text-lg">
                    {firstName + " " + lastName}
                  </h2>
                  {age && gender && (
                    <p className="text-sm text-black-500">{age + ", " + gender}</p>
                  )}
                  <p className="text-sm text-black-500">{about}</p>
                </div>
              </div>

              {/* Right section: Buttons */}
              <div className="flex gap-2">
                <button
                   className="flex items-center gap-2 sm:gap-3 bg-white text-[#B77466] border border-[#B77466] font-semibold py-1.5 sm:py-2 px-4 sm:px-5 rounded-full shadow-sm hover:scale-95 transition-transform duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base"
                  onClick={() => reviewRequest("rejected", request._id)}
                >
                  Reject
                </button>
               
                <button
                    className="flex items-center gap-2 sm:gap-3 bg-[#B77466] text-white font-semibold py-1.5 sm:py-2 px-4 sm:px-5 rounded-full shadow-md hover:scale-95 transition-transform duration-200 border-none disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base"
                    
                  onClick={() => reviewRequest("accepted", request._id)}
                >
                  Accept
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Requests;
