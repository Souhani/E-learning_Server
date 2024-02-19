import http from "http";
import { Server as SocketIDServer } from "socket.io";

export const initSocketServer = (httpServer: http.Server) => {
  const io = new SocketIDServer(httpServer);
  io.on("connection", (socket) => {
    console.log("A User Connected.");
    socket.on("notification", (data) => {
         io.emit("newNotification");
    });
    socket.on("disconnect", () => {
        console.log("A user disconnected.")
    })
  });
};

