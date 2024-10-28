import { WebSocket } from "ws";
import { db } from "../db/db.ts";

export function handleAddUserToRoom(
  connection: WebSocket,
  roomId: number,
  playerId: number
) {
  const result = db.addUserToRoom(roomId, playerId);

  if (result.isSuccess) {
    broadcastRoomUpdate();
  } else {
    sendErrorMessage(connection, result.message);
  }
}

export function handleCreateRoom(connection: WebSocket, playerId: number) {
  const { roomId } = db.createRoom(playerId);
  const playerInRoom = db.isPlayerInRoom(roomId, playerId);

  if (!playerInRoom) {
    db.addUserToRoom(roomId, playerId);
  }

  broadcastRoomUpdate();
}

function broadcastRoomUpdate() {
  const roomsWithPlayers = Array.from(db.rooms.values()).map((room) => ({
    roomId: room.roomId,
    roomUsers: room.players.map((player) => ({
      name: player.name,
      index: player.id,
    })),
  }));

  const updateMessage = JSON.stringify({
    type: "update_room",
    data: JSON.stringify(roomsWithPlayers),
    id: 0,
  });

  console.log("updateMessage", updateMessage);
  for (const connection of db.connectionToPlayer.keys()) {
    connection.send(updateMessage);
  }
}

function sendErrorMessage(connection: WebSocket, message: string) {
  connection.send(
    JSON.stringify({
      type: "error",
      message,
    })
  );
}
