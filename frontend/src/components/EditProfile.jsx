import { useState } from "react";
import UserCard from "./UserCard";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";

const EditProfile = ({ user }) => {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [photoFile, setPhotoFile] = useState(null);
  const [skills, setSkills] = useState(user.skills || []);

  const [age, setAge] = useState(user.age || "");
  const [gender, setGender] = useState(user.gender || "");
  const [about, setAbout] = useState(user.about || "");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  const saveProfile = async () => {
    setError("");
    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("age", age);
      formData.append("gender", gender);
      formData.append("about", about);
      formData.append("skills", JSON.stringify(skills));
      if (photoFile) formData.append("photo", photoFile);

      const res = await axios.patch(BASE_URL + "/profile/edit", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      dispatch(addUser(res?.data?.data));
      console.log("photoFile",photoFile)
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      setError(err.response?.data || "Something went wrong");
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-center items-start my-10 gap-10">
        {/* Edit Form */}
        <div className="card bg-[#D9CFC7] w-96 shadow-xl">
          <div className="card-body">
            <h2 className="card-title justify-center">Edit Profile</h2>

            <label className="form-control w-full max-w-xs my-2">
              <div className="label">
                <span className="label-text">First Name:</span>
              </div>
              <input
                type="text"
                value={firstName}
                className="input input-bordered w-full max-w-xs"
                onChange={(e) => setFirstName(e.target.value)}
              />
            </label>

            <label className="form-control w-full max-w-xs my-2">
              <div className="label">
                <span className="label-text">Last Name:</span>
              </div>
              <input
                type="text"
                value={lastName}
                className="input input-bordered w-full max-w-xs"
                onChange={(e) => setLastName(e.target.value)}
              />
            </label>

            {/* File Upload */}
            <label className="form-control w-full max-w-xs my-2">
              <div className="label">
                <span className="label-text">Profile Image:</span>
              </div>
              <input
                type="file"
                accept="image/*"
                className="file-input file-input-bordered w-full max-w-xs"
                onChange={(e) => setPhotoFile(e.target.files[0])}
              />
            </label>

            <label className="form-control w-full max-w-xs my-2">
              <div className="label">
                <span className="label-text">Age:</span>
              </div>
              <input
                type="number"
                value={age}
                className="input input-bordered w-full max-w-xs"
                onChange={(e) => setAge(e.target.value)}
              />
            </label>

            <label className="form-control w-full max-w-xs my-2">
              <div className="label">
                <span className="label-text">Gender:</span>
              </div>
              <input
                type="text"
                value={gender}
                className="input input-bordered w-full max-w-xs"
                onChange={(e) => setGender(e.target.value)}
              />
            </label>

            <label className="form-control w-full max-w-xs my-2">
  <div className="label">
    <span className="label-text">Skills (comma separated):</span>
  </div>
  <input
    type="text"
    value={skills.join(",")}
    className="input input-bordered w-full max-w-xs"
    onChange={(e) => setSkills(e.target.value.split(",").map(s => s.trim()))}
  />
</label>


            <label className="form-control w-full max-w-xs my-2">
              <div className="label">
                <span className="label-text">About:</span>
              </div>
              <input
                type="text"
                value={about}
                className="input input-bordered w-full max-w-xs"
                onChange={(e) => setAbout(e.target.value)}
              />
            </label>

            <p className="text-red-500">{error}</p>

            <div className="card-actions justify-center m-2">
            <button
    className="btn bg-[#B77466] text-white hover:bg-[#B77466] hover:scale-95 transition-transform"
    onClick={saveProfile}
  >
    Save Profile
  </button>
            </div>
          </div>
        </div>

        {/* Preview Card */}
        <UserCard
          user={{
            firstName,
            lastName,
            photoUrl:
              photoFile
                ? URL.createObjectURL(photoFile)
                : user.photoUrl,
            age,
            gender,
            about,
            skills
          }}
        />
      </div>

      {/* Explore Section */}
      <div className="flex justify-center my-6">
        <div className="border border-gray-400 rounded-lg p-5 w-[500px] flex justify-between items-center shadow-md bg-base-200">
          <p className="text-gray-800 font-medium">
            Want to make new friends?
          </p>
          <button
  className="btn bg-[#a78a7f] text-white hover:bg-[#a78a7f] hover:scale-95 transition-transform duration-200 shadow-md"
  onClick={() => navigate("/feed")}
>
  Explore
</button>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
  <div className="toast toast-top toast-center mt-16 z-50">
    <div className="alert bg-[#c9e4ca] shadow-lg">
      <span>Profile saved successfully 🎉</span>
    </div>
  </div>
)}

    </>
  );
};

export default EditProfile;
