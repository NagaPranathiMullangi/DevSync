import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { createSocketConnection } from "../utils/socket";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { FaCheck, FaCheckDouble, FaCircle } from "react-icons/fa";

const Chat = () => {
  const { targetUserId } = useParams();
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTargetOnline, setIsTargetOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);
  const [targetUser, setTargetUser] = useState(null);

  const user = useSelector((store) => store.user);
  const userId = user?._id;
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 🔹 Fetch chat + target user details
  const fetchChatMessages = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/chat/${targetUserId}`, {
        withCredentials: true,
      });
      const chatData = res?.data;
      setChatId(chatData?._id);

      const msgs = chatData?.messages.map((m) => ({
        ...m,
        chatId: chatData?._id,
        senderId: m.senderId?._id,
        firstName: m.senderId?.firstName,
        lastName: m.senderId?.lastName,
      }));
      setMessages(msgs || []);

      const userRes = await axios.get(`${BASE_URL}/profile/${targetUserId}`, {
        withCredentials: true,
      });
      setTargetUser(userRes.data);
    } catch (err) {
      console.error("❌ Error fetching chat:", err);
    }
  };

  useEffect(() => {
    fetchChatMessages();
  }, [targetUserId]);

  // 🔹 Setup socket
  useEffect(() => {
    if (!userId || socketRef.current) return;
    const socket = createSocketConnection();
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinChat", { firstName: user.firstName, userId, targetUserId });
      socket.emit("checkOnlineStatus", { targetUserId });
    });

    socket.on("userOnlineStatus", ({ userId: id, online }) => {
      if (String(id) === String(targetUserId)) {
        setIsTargetOnline(online);
        if (!online) fetchLastSeen();
      }
    });

    socket.on("messageReceived", (msg) => {
      setMessages((prev) => {
        const exists = prev.find((m) => m._id === msg._id || m.tempId === msg.tempId);
        return exists ? prev : [...prev, msg];
      });
    });

    socket.on("messageDelivered", ({ _id, delivered }) => {
      setMessages((prev) => prev.map((m) => (m._id === _id ? { ...m, delivered } : m)));
    });

    socket.on("messageSeen", ({ messageId, seenAt }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, seen: true, seenAt } : m))
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  const fetchLastSeen = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/${targetUserId}/lastSeen`, {
        withCredentials: true,
      });
      setLastSeen(res.data.lastSeen);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const socket = socketRef.current;
    if (!socket) return;

    const tempId = "temp-" + Date.now();
    const now = new Date().toISOString();

    socket.emit("sendMessage", {
      firstName: user.firstName,
      lastName: user.lastName,
      userId,
      targetUserId,
      text: newMessage,
      tempId,
    });

    setMessages((prev) => [
      ...prev,
      {
        tempId,
        chatId,
        senderId: userId,
        firstName: user.firstName,
        lastName: user.lastName,
        text: newMessage,
        delivered: isTargetOnline,
        seen: isTargetOnline,
        createdAt: now,
        seenAt: isTargetOnline ? now : null,
      },
    ]);

    setNewMessage("");
  };

  // 🔹 Auto-scroll to last message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (t) =>
    t ? new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <div className="w-full md:w-3/4 mx-auto h-[100vh] md:h-[85vh] flex flex-col bg-white border border-gray-300 rounded-none md:rounded-xl shadow-md">
      {/* Header */}
      <div className="p-3 md:p-4 border-b border-gray-200 flex items-center gap-3 bg-white sticky top-0 z-10">
        {targetUser && (
          <img
            src={
              targetUser.photoUrl?.startsWith("http")
                ? targetUser.photoUrl
                : `${BASE_URL}${targetUser.photoUrl}`
            }
            alt="user"
            className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border border-[#B77466]"
          />
        )}
        <div className="leading-tight">
          <p className="font-semibold text-[#B77466] text-base md:text-lg">
            {targetUser ? `${targetUser.firstName} ${targetUser.lastName}` : "User"}
          </p>
          {isTargetOnline ? (
            <p className="text-green-600 text-xs flex items-center gap-1">
              <FaCircle className="text-[8px]" /> Online
            </p>
          ) : (
            <p className="text-gray-500 text-xs italic">
              Last seen: {lastSeen ? formatTime(lastSeen) : "Recently"}
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-5 space-y-3 bg-white">
        {messages.map((m, i) => {
          const mine = m.senderId === userId;
          return (
            <div key={i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] md:max-w-[65%] rounded-2xl px-3 py-2 text-sm md:text-base ${
                  mine ? "bg-[#F7E2D6] text-[#3C2A21]" : "bg-gray-100 text-[#3C2A21]"
                } shadow`}
              >
                <div className="flex items-center gap-1">
                  <span>{m.text}</span>
                  {mine && (
                    <>
                      {m.seen ? (
                        <FaCheckDouble className="text-blue-500 text-xs" />
                      ) : m.delivered ? (
                        <FaCheckDouble className="text-gray-500 text-xs" />
                      ) : (
                        <FaCheck className="text-gray-500 text-xs" />
                      )}
                    </>
                  )}
                </div>
                {/* 🕓 Time shown for all messages */}
                <div className="text-[10px] text-gray-500 mt-1 text-right">
                  {m.seen
                    ? `Seen at ${formatTime(m.seenAt)}`
                    : `Sent at ${formatTime(m.createdAt || m.seenAt)}`}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input & Button */}
      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#B77466]"
          />
          <button
            onClick={sendMessage}
            className="bg-[#B77466] hover:bg-[#a86457] text-white font-semibold px-5 py-2 rounded-full text-sm md:text-base transition-all duration-200"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
