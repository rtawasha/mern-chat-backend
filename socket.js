const socketIo = (io) => {
  const connectedUsers = new Map();
  io.on("connection", (socket) => {
    const user = socket.handshake.auth.user;  
    console.log("User connected", user?.username);
    //! 1- Join room Handler
    socket.on("join room", (groupId) => {
      socket.join(groupId);    
      connectedUsers.set(socket.id, { user, room: groupId });
      const usersInRoom = Array.from(connectedUsers.values())
        .filter((u) => u.room === groupId)
        .map((u) => u.user);
      io.in(groupId).emit("users in room", usersInRoom);
      socket.to(groupId).emit("notification", {
        type: "USER_JOINED",
        message: `${user?.username} has joined`, 
        user: user,
      });
    });  

    //! 2- Leave room Handler
    socket.on("leave room", (groupId) => {
      console.log(`${user?.username} leaving room:`, groupId);
      socket.leave(groupId);
      if (connectedUsers.has(socket.id)) {
        connectedUsers.delete(socket.id);
        socket.to(groupId).emit("user left", user?._id);
      }
    });   

    //! 3- Send New Message Handler
    //Triggered when user sends a new message
    socket.on("new message", (message) => {
      // Broadcast message to all other users in the room
      socket.to(message.groupId).emit("message received", message);  
    });   

    //! 4- Disconnect Handler 
    socket.on("disconnect", () => {
      console.log(`${user?.username} disconnected`);
      if (connectedUsers.has(socket.id)) {
        // Get user's room info before removing
        const userData = connectedUsers.get(socket.id);
        //Notify others in the room about user's departure
        socket.to(userData.room).emit("user left", user?._id);
        //Remove user from connected users
        connectedUsers.delete(socket.id);
      }
    });   

    //! 5- Typing Indicator
    socket.on("typing", ({ groupId, username }) => {
      socket.to(groupId).emit("user typing", { username });
    });
    socket.on("stop typing", ({ groupId }) => {
      //Broadcast stop typing status to other users in the room
      socket.to(groupId).emit("user stop typing", { username: user?.username });
    });   
  });
};

module.exports = socketIo;
