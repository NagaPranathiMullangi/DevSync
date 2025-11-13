const express = require("express");
const userRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

// Get all the pending connection request for the loggedIn user
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    console.log("into feed");
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);
    // }).populate("fromUserId", ["firstName", "lastName"]);

    res.json({
      message: "Data fetched successfully",
      data: connectionRequests,
    });
  } catch (err) {
    req.statusCode(400).send("ERROR: " + err.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    console.log(connectionRequests);

    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.json({ data });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    // ⭐ Decide limit based on membership
    let limit = 20;  // default for non-premium / none

    if (loggedInUser.membershipType === "silver") {
      
      limit = 50;
      
    } 
    else if (loggedInUser.membershipType === "gold") {
      limit = 100;
    }

    // ⭐ Pagination
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    // ⭐ Get users to hide (already interacted)
    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id },
        { toUserId: loggedInUser._id }
      ]
    }).select("fromUserId toUserId");

    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    // ⭐ Fetch only new users
    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: loggedInUser._id ? { $ne: loggedInUser._id } : {} }
      ]
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.json({
      data: users,
      limit,
      page,
      membershipType: loggedInUser.membershipType
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

userRouter.get("/:userId/lastSeen", userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("isOnline lastSeen");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


userRouter.get("/users/verified-list", userAuth, async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // find all connection requests
    const allRequests = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUserId },
        { toUserId: loggedInUserId }
      ]
    });

    const excludedUsers = new Set();
    allRequests.forEach((req) => {
      excludedUsers.add(req.fromUserId.toString());
      excludedUsers.add(req.toUserId.toString());
    });

    
    

  

    // Final List
    const users = await User.find({
      _id: { $nin: [...excludedUsers, loggedInUserId] },
    }).select("firstName lastName emailId photoUrl");

    res.json({ data: users });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = userRouter;
