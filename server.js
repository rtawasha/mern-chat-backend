const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http"); 
const socketio = require("socket.io");
const socketIo = require("./socket");   
const userRouter = require("./routes/userRoutes");
const groupRouter = require("./routes/groupRoutes");
const messageRouter = require("./routes/messageRoutes");
dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
// initialize socket.io 
const io = socketio(server, {
  cors: {
    origin: ["https://mern-chat-backend-1-ayvm.onrender.com",                 
            "https://warm-souffle-dfc0c4.netlify.app/"],   
    allowedHeaders: ["my-custom-header"],
    methods: ["GET", "POST"],
    credentials: true,  //! allow cookies, tokens, etc.
  },
});   

//middlewares
app.use(cors());
app.use(express.json());

//connect to db
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log("Mongodb connected failed", err));

//Initialize socket.io using our custom middleware socket.js
socketIo(io);

// show our routes displayed in localhost http://localhost:5000/
app.get("/", (req, res) => {
  res.json({
    name: "backend",
    project: "MERN Chat App using Socket.IO",
    message: "Welcome to MERN Chat Application",
    developedBy: "MasynTech",
    website: "www.masynctech.com",
  });
});
app.use("/api/users", userRouter);       
app.use("/api/groups", groupRouter);     
app.use("/api/messages", messageRouter); 

//start the server
server.listen(PORT, console.log("Server is up and running on port", PORT));
