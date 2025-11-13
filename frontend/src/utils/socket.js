import { io } from "socket.io-client";
import { BASE_URL } from "./constants";

let socket;

export const createSocketConnection = () => {
  if (!socket) {
    socket = io(BASE_URL, { withCredentials: true });
  }
  return socket;
};
