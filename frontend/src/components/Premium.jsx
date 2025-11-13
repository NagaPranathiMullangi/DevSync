import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Premium = () => {
  const [isUserPremium, setIsUserPremium] = useState(false);
  const [membershipType, setMembershipType] = useState("");
  const [isLoading, setIsLoading] = useState(true); // 🔹 Added
  const navigate = useNavigate();

  useEffect(() => {
    verifyPremiumUser();
  }, []);

  const verifyPremiumUser = async () => {
    try {
      const res = await axios.get(BASE_URL + "/premium/verify", {
        withCredentials: true,
      });

      if (res.data.isPremium) {
        setIsUserPremium(true);
        setMembershipType(res.data.membershipType || "");
      } else {
        setIsUserPremium(false);
      }
    } catch (err) {
      console.error("Error verifying premium user:", err);
    } finally {
      setIsLoading(false); // 🔹 Stop loading after request completes
    }
  };

  const handleBuyClick = async (type) => {
    const order = await axios.post(
      BASE_URL + "/payment/create",
      {
        membershipType: type,
      },
      { withCredentials: true }
    );

    const { amount, keyId, currency, notes, orderId } = order.data;

    const options = {
      key: keyId,
      amount,
      currency,
      name: "Dev Tinder",
      description: "Connect to other developers",
      order_id: orderId,
      prefill: {
        name: notes.firstName + " " + notes.lastName,
        email: notes.emailId,
        contact: "9999999999",
      },
      theme: {
        color: "#F37254",
      },
      handler: verifyPremiumUser,
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  // 🔹 Show loading indicator while fetching premium status
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="text-[#B77466] text-lg font-semibold animate-pulse">
          Checking your membership...
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-8 md:px-16 my-10 text-center">
      {isUserPremium ? (
        <div>
          <h1 className="text-3xl font-bold text-[#B77466] mb-3">
            🎉 You’re a {membershipType.toUpperCase()} Member!
          </h1>

          <div className="bg-[#D9CFC7] rounded-2xl shadow-xl p-6 max-w-md mx-auto">
            <ul className="text-left text-[#3C2A21] leading-relaxed">
              <li>• Feed Limit: {membershipType === "silver" ? "50/day" : "100/day"}</li>
              <li>• Chat with verified unConnected users</li>
              <li>• View ignored user insights</li>
              <li>• Validity: {membershipType === "silver" ? "3 months" : "6 months"}</li>
            </ul>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
              <button
                className="btn bg-[#B77466] text-white hover:bg-[#B77466] hover:scale-95 transition-transform"
                onClick={() => navigate("/ignored/byyou")}
              >
                👋 Users You Ignored
              </button>
              <button
                className="btn bg-[#a78a7f] text-white hover:bg-[#a78a7f] hover:scale-95 transition-transform"
                onClick={() => navigate("/ignored/you")}
              >
                🚫 Users Who Ignored You
              </button>
             
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
            <button
    className="btn bg-[#6a4b3a] text-white hover:bg-[#6a4b3a] hover:scale-95 transition-transform"
    onClick={() => navigate("/verified-users")}
  >
    💬 chat with others
  </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row justify-center gap-8 text-center">
          <div className="card bg-[#FBF3D5] shadow-lg rounded-2xl p-6 flex-1">
            <h1 className="text-2xl font-bold text-[#3C2A21] mb-3">🥈 Silver Membership</h1>
            <ul className="text-left text-[#4B3B37] mx-auto w-fit mb-4 leading-relaxed">
              <li>• 50 new connections per day</li>
              <li>• Chat with verified users</li>
              <li>• View top 3 ignored users (by and from you)</li>
              <li>• Validity: 3 months</li>
            </ul>
            <button
              onClick={() => handleBuyClick("silver")}
              className="btn bg-[#B77466] text-white hover:bg-[#B77466] hover:scale-95 transition-transform"
            >
              Buy Silver
            </button>
          </div>

          <div className="hidden lg:flex items-center justify-center font-bold text-[#B77466] text-xl">
            OR
          </div>

          <div className="card bg-[#D9CFC7] shadow-lg rounded-2xl p-6 flex-1">
            <h1 className="text-2xl font-bold text-[#3C2A21] mb-3">🥇 Gold Membership</h1>
            <ul className="text-left text-[#4B3B37] mx-auto w-fit mb-4 leading-relaxed">
              <li>• 100 new connections per day</li>
              <li>• Chat with any verified user</li>
              <li>• View all ignored users (by and from you)</li>
              <li>• Validity: 6 months</li>
            </ul>
            <button
              onClick={() => handleBuyClick("gold")}
              className="btn bg-[#B77466] text-white hover:bg-[#B77466] hover:scale-95 transition-transform"
            >
              Buy Gold
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Premium;
