const socketIO = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const User = require("../models/user");

// Generate a consistent private room ID between two users
const getSecretRoomId = (u1, u2) =>
  crypto
    .createHash("sha256")
    .update([u1.toString(), u2.toString()].sort().join("$"))
    .digest("hex");

const initializeSocket = (server) => {
  const io = socketIO(server, {
    cors: { origin: "http://localhost:5173", credentials: true },
  });

  const onlineUsers = new Map(); // userId -> socketId

  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);

    // 🟢 User joins chat
    socket.on("joinChat", async ({ firstName, userId, targetUserId }) => {
      if (!userId || !targetUserId) return;

      const roomId = getSecretRoomId(userId, targetUserId);
      socket.join(roomId);
      onlineUsers.set(userId.toString(), socket.id);

      console.log(`🟢 ${firstName} (${userId}) joined room ${roomId}`);
      await User.findByIdAndUpdate(userId, { isOnline: true });

      // Notify participants of online status
      setTimeout(() => {
        io.to(roomId).emit("userOnlineStatus", { userId, online: true });
      }, 500);
    });

    // 💬 Send Message
    socket.on(
      "sendMessage",
      async ({ firstName, lastName, userId, targetUserId, text, tempId }) => {
        try {
          const roomId = getSecretRoomId(userId, targetUserId);

          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });
          if (!chat)
            chat = new Chat({ participants: [userId, targetUserId], messages: [] });

          const newMsg = {
            senderId: userId,
            text,
            delivered: false,
            seen: false,
            createdAt: new Date(),
          };

          chat.messages.push(newMsg);
          await chat.save();

          const savedMsg = chat.messages[chat.messages.length - 1];
          const receiverSocket = onlineUsers.get(targetUserId.toString());
          if (receiverSocket) savedMsg.delivered = true;
          await chat.save();

          io.to(roomId).emit("messageReceived", {
            ...savedMsg.toObject(),
            chatId: chat._id,
            firstName,
            lastName,
            tempId: tempId || null,
          });

          io.to(socket.id).emit("messageDelivered", {
            _id: savedMsg._id,
            chatId: chat._id,
            delivered: true,
          });
        } catch (err) {
          console.error("❌ Error sending message:", err);
        }
      }
    );

    // 👁 Mark messages as seen
    socket.on("markSeen", async ({ chatId, userId, targetUserId }) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat) return;

        let updated = false;
        chat.messages.forEach((msg) => {
          if (
            msg.senderId.toString() === targetUserId.toString() &&
            !msg.seen
          ) {
            msg.seen = true;
            msg.seenAt = new Date();
            updated = true;
          }
        });

        if (updated) await chat.save();

        const roomId = getSecretRoomId(userId, targetUserId);
        io.to(roomId).emit("messageSeenBulk", {
          userId,
          seenAt: new Date(),
        });

        console.log(`👁 messageSeenBulk emitted for ${userId} in room ${roomId}`);
      } catch (err) {
        console.error("❌ Error marking seen:", err);
      }
    });

    // 🟣 Check online status manually
    socket.on("checkOnlineStatus", ({ targetUserId }) => {
      const online = onlineUsers.has(targetUserId.toString());
      socket.emit("userOnlineStatus", { userId: targetUserId, online });
    });

    // 🔴 Disconnect
    socket.on("disconnect", async () => {
      const userId = [...onlineUsers.entries()].find(([_, id]) => id === socket.id)?.[0];
      if (userId) {
        onlineUsers.delete(userId);
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date(),
        });

        console.log(`🔴 User ${userId} went offline`);
        io.emit("userOnlineStatus", { userId, online: false });
      }
    });
  });
};

module.exports = initializeSocket;
