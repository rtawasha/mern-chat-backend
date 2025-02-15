const express = require("express");
const Message = require("../models/ChatModel");
const Group = require("../models/GroupModel");
const { protect } = require("../middleware/authMiddleware");

const messageRouter = express.Router();

//! 1- send message. 
messageRouter.post("/", protect, async (req, res) => {
  try {
    console.log("req.body !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", req.body);
    const { content, groupId } = req.body;

    const groupExists = await Group.findById(groupId);
    if (!groupExists) {
      return res.status(400).json({ message: "Invalid group ID" });
    }
    console.log(groupExists);

    const message = await Message.create({
      sender: req.user._id,   
      content,
      group: groupId,  
    });
    
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "username email" )
      .populate("group", "name");
    console.log(populatedMessage);
    
    res.json(populatedMessage);
  } catch (error) {
    res.status(400).json({ message: error.Message });
  }
});


//! 2- Get all messages by Group [ can filter by user(email) too ]
messageRouter.get("/:groupId", protect, async (req, res) => {
  try {
    const messages = await Message.find({ group: req.params.groupId })
      .populate("sender", "username email")
      .populate("group", "name")    
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.Message });
  }
});

//! 3- Get all messages by Sender (user id )
messageRouter.get("/:userId/user", protect, async (req, res) => { 
  try { 
    const messages = await Message.find({ sender: req.params.userId })
    .populate("sender", "username email")
    .populate("group", "name")
    .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message})
  }
});

module.exports = messageRouter;
