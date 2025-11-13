const express = require("express");
const profileRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");
const upload = require("../middlewares/upload");
const User = require("../models/user");
const Request = require("../models/connectionRequest");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

profileRouter.patch(
  "/profile/edit",
  userAuth,
  upload.single("photo"),
  async (req, res) => {
    try {
      const loggedInUser = req.user;

      //console.log(req.user);

      // If a new photo is uploaded
      if (req.file) {
        loggedInUser.photoUrl = `/uploads/${req.file.filename}`;
      }

      // Update other profile fields
      const fields = ["firstName", "lastName", "age", "gender", "about"];
      fields.forEach((key) => {
        if (req.body[key]) loggedInUser[key] = req.body[key];
      });


      if (req.body.skills) {
        try {
          const parsedSkills = JSON.parse(req.body.skills);
          if (Array.isArray(parsedSkills)) {
            loggedInUser.skills = parsedSkills;
          }
        } catch (e) {
          console.log("Invalid skills JSON");
        }
      }


      await loggedInUser.save();

     // console.log(loggedInUser);

      res.json({
        message: `${loggedInUser.firstName}, your profile updated successfully.`,
        data: loggedInUser,
      });
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  }
);


profileRouter.get("/profile/:id", userAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select(
      "firstName lastName age gender about photoUrl isOnline lastSeen skills"
    );

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.json(user);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});



module.exports = profileRouter;
