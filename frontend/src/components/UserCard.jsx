import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { removeUserFromFeed } from "../utils/feedSlice";
import { FaHeart } from "react-icons/fa";

const UserCard = ({ user }) => {
  console.log("user in explore ",user)
  const { _id, firstName, lastName, photoUrl, age, gender, about, skills = [] } = user;

  {console.log("photourl",photoUrl)}
  const dispatch = useDispatch();

  const [animation, setAnimation] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const ANIM_DURATION = 800; // smooth and visible swipe

  const sendUserResponse = async (status, userId) => {
    try {
      await axios.post(`${BASE_URL}/request/send/${status}/${userId}`, {}, { withCredentials: true });
    } catch (err) {
      console.error("request error:", err);
    }
  };

  const handleInterested = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setAnimation("swipe-right");
    setTimeout(() => {
      dispatch(removeUserFromFeed(_id));
      sendUserResponse("interested", _id);
    }, ANIM_DURATION);
  };

  const handleIgnore = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setAnimation("swipe-left");
    setTimeout(() => {
      dispatch(removeUserFromFeed(_id));
      sendUserResponse("ignored", _id);
    }, ANIM_DURATION);
  };

  return (
    <div className="flex justify-center items-center px-3 sm:px-5 md:px-10">
      <div
        className={`relative bg-[#D9CFC7] rounded-2xl overflow-hidden shadow-lg transform transition-all duration-[${ANIM_DURATION}ms] ease-out ${animation}`}
        style={{
          width: "100%",
          maxWidth: "420px",
          minWidth: "270px",
          border: "1px solid rgba(255,255,255,0.3)",
          backdropFilter: "blur(6px)",
          boxShadow:
            "0 4px 30px rgba(0, 0, 0, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.25)",
        }}
      >
        {/* Image */}
        <figure className="relative flex justify-center items-center bg-[#EDE4DA]">
          <img
           
            src={
              photoUrl
                ? photoUrl.startsWith("blob:") // 🟢 Temporary preview before saving
                  ? photoUrl
                  : photoUrl.startsWith("http") // 🟢 Full URL (like Cloudinary or API)
                  ? photoUrl
                  : `${BASE_URL}${photoUrl}` // 🟢 Relative path from backend (/uploads/...)
                : "https://cdn-icons-png.flaticon.com/512/149/149071.png" // 🔴 Default icon
            }
            
            alt={`${firstName}'s photo`}
            className="w-full h-[260px] sm:h-[320px] md:h-[360px] object-cover rounded-t-2xl transition-all duration-300"
          />
          <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#B77466]/90 to-transparent py-2 text-center text-white font-semibold text-base sm:text-lg md:text-xl">
            {firstName} {lastName}
          </div>
        </figure>

        {/* Body */}
        <div className="p-3 sm:p-4 text-center">
          {age && gender && (
            <p className="text-[#4B3B37] text-sm italic mb-1">
              {age} years old, {gender}
            </p>
          )}

          <p className="text-[#3C2A21] text-sm sm:text-base font-medium leading-snug min-h-[44px]">
            {about || "No description available."}
          </p>

          {/* Skills */}
          {skills.length > 0 && (
  <div className="mt-3 text-left px-5">
    <p className="text-[#3C2A21] font-semibold mb-1">Skills:</p>
    <ul className="list-disc list-inside text-[#4B3B37] text-sm sm:text-base leading-relaxed">
      {skills.map((skill, index) => (
        <li key={index}>{skill}</li>
      ))}
    </ul>
  </div>
)}

          {/* Buttons */}
          <div className="mt-4 flex items-center justify-center gap-3 sm:gap-4 flex-wrap">

              {/* Ignore Button */}
              <button
              onClick={handleIgnore}
              disabled={isProcessing}
              className="flex items-center gap-2 sm:gap-3 bg-white text-[#B77466] border border-[#B77466] font-semibold py-1.5 sm:py-2 px-4 sm:px-5 rounded-full shadow-sm hover:scale-95 transition-transform duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              🚫 Ignore
            </button>
            {/* Interested Button */}
            <button
              onClick={handleInterested}
              disabled={isProcessing}
              className="flex items-center gap-2 sm:gap-3 bg-[#B77466] text-white font-semibold py-1.5 sm:py-2 px-4 sm:px-5 rounded-full shadow-md hover:scale-95 transition-transform duration-200 border-none disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <span className="bg-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center">
                <FaHeart className="text-[#B77466] w-3.5 h-3.5" />
              </span>
              Interested
            </button>

          
          </div>
        </div>
      </div>

      {/* Swipe animation styles */}
      <style >{`
        .swipe-right {
          transform: translateX(150%) rotate(10deg);
          opacity: 0;
          transition: all ${ANIM_DURATION}ms ease-in-out;
        }
        .swipe-left {
          transform: translateX(-150%) rotate(-10deg);
          opacity: 0;
          transition: all ${ANIM_DURATION}ms ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default UserCard;
