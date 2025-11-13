const express = require("express");
const requestRouter = express.Router();
const nodemailer = require("nodemailer"); // Import nodemailer if not already imported
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");



//const sendEmail = require("../utils/sendEmail");

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid status type: " + status });
      }

      const toUser = await User.findById(toUserId);
      console.log("to user details",toUser);
      if (!toUser) {
        return res.status(404).json({ message: "User not found!" });
      }

      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingConnectionRequest) {
        return res
          .status(400)
          .send({ message: "Connection Request Already Exists!!" });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      // const emailRes = await sendEmail.run(
      //   "A new friend request from " + req.user.firstName,
      //   req.user.firstName + " is " + status + " in " + toUser.firstName
      // );
      // console.log(emailRes);

       // Send email notification
       if(status == "interested"){
       const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "nagapranathinagapranathi@gmail.com", // Replace with your personal email
          pass:"ilsh lyig gxmr gaun", // Replace with your email password or app password
        },
      });

      console.log("email is ",toUser.emailId);
      const mailOptions = {
        from: "nagapranathinagapranathi@gmail.com", // Sender's email
        to: toUser.emailId, // Recipient's email (from the `toUser` object)
        subject: "New Friend Request",
        html: 
    `<html>
      <body>
        <p>Hello,</p>
        <p>
          You have received a new friend request from <strong>${req.user.firstName}</strong>.
        </p>
        <p>
          Please try to view the request and accept it if you like.
        </p>
        <p>
          Request status: <strong>${status}</strong>
        </p>
        <p>Best regards,<br>Your Team</p>
      </body>
    </html>`,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully.");
      } catch (emailError) {
        console.error("Error sending email:", emailError.message);
      }

    }

      res.json({
        message:
          req.user.firstName + " is " + status + " in " + toUser.firstName,
        data,
      });
    } catch (err) {
      console.log(err);
      res.status(400).send("ERROR: " + err.message);
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ messaage: "Status not allowed!" });
      }

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });
      if (!connectionRequest) {
        return res
          .status(404)
          .json({ message: "Connection request not found" });
      }

      connectionRequest.status = status;

      const data = await connectionRequest.save();

      res.json({ message: "Connection request " + status, data });
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  }
);


// ✅ Update request status (ignored <-> interested)
requestRouter.patch("/request/update/:status/:targetUserId", userAuth, async (req, res) => {
  try {
    const { status, targetUserId } = req.params;
    const user = req.user;

    // Allowed statuses
    if (!["ignored", "interested"].includes(status)) {
      return res.status(400).send("Invalid status");
    }

    // Update your request model (you may have Request or Relation schema)
    const relation = await ConnectionRequest.findOneAndUpdate(
      {
        $or: [
          { fromUserId: user._id, toUserId: targetUserId },
          { fromUserId: targetUserId, toUserId: user._id },
        ],
      },
      { status },
      { new: true }
    );

    if (!relation) {
      return res.status(404).send("Relation not found between users");
    }

    res.json({ message: "Relationship updated successfully", relation });
  } catch (err) {
    res.status(500).send("Error updating relationship: " + err.message);
  }
});

module.exports = requestRouter;
