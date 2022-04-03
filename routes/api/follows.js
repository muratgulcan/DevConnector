const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const Follow = require("../../models/Follow");

router.post("/follow", auth, async (req, res) => {
  try {
    const isFollowing = await Follow.findOne({
      userId: req.user.id,
      followId: req.body._id,
    });
    if (isFollowing) {
      return res.status(400).json({ msg: "User is following" });
    }
    const newFollow = new Follow({
      userId: req.user.id,
      followId: req.body._id,
    });

    await newFollow.save();
    const followers = await Follow.find({ userId: req.user.id });
    res.json(followers);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
});

router.delete("/unfollow/:id", auth, async (req, res) => {
  try {
    const unfollow = await Follow.findOne({
      userId: req.user.id,
      followId: req.params.id,
    });
    if (!unfollow) {
      return res.status(400).json({ msg: "Bir sorun var" });
    }

    //check user
    if (unfollow.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Bir sorun vars" });
    }

    await unfollow.remove();
    const followers = await Follow.find({ userId: req.user.id });
    res.json(followers);

  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
});

module.exports = router;
