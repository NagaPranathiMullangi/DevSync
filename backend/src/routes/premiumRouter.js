const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Request = require("../models/connectionRequest");
const { userAuth } = require("../middlewares/auth");

// ✅ Get ignored users list
router.get("/premium/ignored-users", userAuth, async (req, res) => {
  try {
    const { type } = req.query;
    console.log("Into premium router, type:", type);
    const user = req.user;

    let ignoredUsers;

    if (type === "byyou") {
      ignoredUsers = await Request.find({ fromUserId: user._id, status: "ignored" })
        .populate("toUserId", "firstName lastName photoUrl");
      ignoredUsers = ignoredUsers.map((r) => r.toUserId);
    } else if (type === "you") {
      ignoredUsers = await Request.find({ toUserId: user._id, status: "ignored" })
        .populate("fromUserId", "firstName lastName photoUrl");
      ignoredUsers = ignoredUsers.map((r) => r.fromUserId);
    } else {
      return res.status(400).send("Invalid query parameter");
    }

    res.json(ignoredUsers);
  } catch (err) {
    console.error("Error fetching ignored users:", err);
    res.status(500).send("Error fetching ignored users");
  }
});

module.exports = router;
