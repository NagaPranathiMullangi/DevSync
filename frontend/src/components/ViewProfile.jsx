import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

const ViewProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/profile/${id}`, {
        withCredentials: true,
      });
      setProfile(res.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  if (!profile)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-[#B77466] text-lg">Loading...</p>
      </div>
    );

  return (
    <div className="flex justify-center my-10">
      <div className="card bg-[#D9CFC7] w-96 shadow-xl">
        <figure>
          <img
            src={
              profile.photoUrl
                ? profile.photoUrl.startsWith("blob:")
                  ? profile.photoUrl
                  : profile.photoUrl.startsWith("http")
                  ? profile.photoUrl
                  : `${BASE_URL}${profile.photoUrl}`
                : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            
            alt="profile"
            className="w-full h-[360px] object-cover"
          />
        </figure>
        <div className="card-body text-center">
          <h2 className="card-title text-[#3C2A21] text-xl font-bold">
            {profile.firstName} {profile.lastName}
          </h2>
          <p className="italic text-[#4B3B37]">
            {profile.age} years old, {profile.gender}
          </p>
          <p className="text-[#3C2A21] mt-2">{profile.about}</p>
          {profile.skills && profile.skills.length > 0 && (
  <div className="mt-3 text-left px-5">
    <p className="text-[#3C2A21] font-semibold mb-1">Skills:</p>
    <ul className="list-disc list-inside text-[#4B3B37] text-sm sm:text-base leading-relaxed">
      {profile.skills.map((skill, index) => (
        <li key={index}>{skill}</li>
      ))}
    </ul>
  </div>
)}

        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
