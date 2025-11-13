import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addFeed } from "../utils/feedSlice";
import { useEffect, useState } from "react";
import UserCard from "./UserCard";

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(true);
  const [key, setKey] = useState(0); // re-render trigger

  const getFeed = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/feed`, {
        withCredentials: true,
      });
      dispatch(addFeed(res?.data?.data));
    } catch (err) {
      console.error("Error fetching feed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getFeed();
  }, []);

  useEffect(() => {
    // Trigger fade + key reset on feed update
    setFadeIn(true);
    setKey((prev) => prev + 1);
    const timer = setTimeout(() => setFadeIn(false), 1000); // ⏳ slower fade (1 second)
    return () => clearTimeout(timer);
  }, [feed]);
  

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-[#B77466] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (!feed || feed.length === 0)
    return (
      <div className="flex items-center justify-center h-screen ">
        <h1 className="text-[#3C2A21] text-xl md:text-2xl font-semibold italic">
          No new users found 🫶
        </h1>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center px-4  transition-all duration-300">
      <div
        key={key}
        className={`transition-opacity duration-200 ${
          fadeIn ? "opacity-0 animate-fadeIn" : "opacity-100"
        }`}
      >
        <UserCard user={feed[0]} />
      </div>
    </div>
  );
};

export default Feed;
