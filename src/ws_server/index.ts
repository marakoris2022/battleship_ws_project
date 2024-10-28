import WebSocket, { WebSocketServer } from "ws";
import { handleReg } from "./modules/handleReg.ts";
import { handleCloseConnection } from "./modules/handleCloseConnection.ts";
import { handleCreateRoom, handleAddUserToRoom } from "./modules/handleRoom.ts";
import { db } from "./db/db.ts";

const WS_PORT = 3000;
const ws = new WebSocketServer({ port: WS_PORT });

console.log(`WebSocketServer is up on the ${WS_PORT} port!`);

ws.on("connection", (connection) => {
  console.log("We have a connection");

  connection.on("message", (data) => {
    handleClientMessage(connection, data);
  });

  connection.on("close", () => {
    handleCloseConnection(connection);
  });
});

ws.on("error", (error) => {
  console.error("WebSocket error:", error);
});

function handleClientMessage(connection: WebSocket, data: WebSocket.RawData) {
  try {
    const dataFromClient = JSON.parse(data.toString());
    const { type: requestType, data: requestData } = dataFromClient;

    switch (requestType) {
      case "reg":
        handleReg(connection, JSON.parse(requestData));
        break;
      case "create_room":
        handleCreateRoomRequest(connection, requestData);
        break;
      case "add_user_to_room":
        handleAddUserToRoomRequest(connection, requestData);
        break;
      default:
        handleUnknownRequest(connection, requestType);
    }
  } catch (error) {
    console.error("Invalid JSON format received:", error);
  }
}

function handleCreateRoomRequest(connection: WebSocket, requestData: any) {
  const playerIdForRoom = db.connectionToPlayer.get(connection);
  if (playerIdForRoom) {
    handleCreateRoom(connection, playerIdForRoom);
  } else {
    sendError(connection, "Player ID not found for connection");
  }
}

function handleAddUserToRoomRequest(connection: WebSocket, requestData: any) {
  const playerIdForAdd = db.connectionToPlayer.get(connection);
  if (playerIdForAdd && requestData.roomId) {
    handleAddUserToRoom(connection, requestData.roomId, playerIdForAdd);
  } else {
    sendError(connection, "Player ID or room ID missing");
  }
}

function handleUnknownRequest(connection: WebSocket, requestType: string) {
  console.warn(`Unhandled request type: ${requestType}`);
  sendError(connection, `Unsupported request type: ${requestType}`);
}

function sendError(connection: WebSocket, message: string) {
  connection.send(
    JSON.stringify({
      type: "error",
      message,
    })
  );
}
