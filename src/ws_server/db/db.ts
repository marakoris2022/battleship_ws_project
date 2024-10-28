import { WebSocket } from "ws";

type PLAYER = {
  id: number;
  name: string;
  password: string;
  online: boolean;
};

type ROOM = {
  roomId: number;
  players: PLAYER[];
};

type DB = {
  _db: PLAYER[];
  rooms: Map<number, ROOM>;
  connectionToPlayer: Map<WebSocket, number>;
  playerCounter: number;
  roomCounter: number;

  addPlayer: (
    name: string,
    password: string
  ) => { isSuccess: boolean; message: string; playerId?: number };
  removePlayer: (name: string) => { isSuccess: boolean; message: string };
  setPlayerConnection: (connection: WebSocket, playerId: number) => void;
  clearPlayerConnection: (connection: WebSocket) => void;
  createRoom: (playerId: number) => { roomId: number };
  addUserToRoom: (
    roomId: number,
    playerId: number
  ) => { isSuccess: boolean; message: string };
  getPlayers: () => PLAYER[];
  isPlayerInRoom: (roomId: number, playerId: number) => boolean;
};

export const db: DB = {
  _db: [],
  rooms: new Map<number, ROOM>(),
  connectionToPlayer: new Map<WebSocket, number>(),
  playerCounter: 0,
  roomCounter: 0,

  addPlayer: (name, password) => {
    const player = db._db.find((p) => p.name === name);

    if (player) {
      if (player.online) {
        return { isSuccess: false, message: "User already in use" };
      }
      if (player.password !== password) {
        return { isSuccess: false, message: "Password is incorrect" };
      }
      player.online = true;
      return {
        isSuccess: true,
        message: "You are logged in",
        playerId: player.id,
      };
    }

    db.playerCounter += 1;
    const newPlayer = { id: db.playerCounter, name, password, online: true };
    db._db.push(newPlayer);
    return {
      isSuccess: true,
      message: "You are logged in",
      playerId: newPlayer.id,
    };
  },

  removePlayer: (name) => {
    const player = db._db.find((p) => p.name === name);

    if (player) {
      player.online = false;
      return { isSuccess: true, message: "User is now offline" };
    }

    return { isSuccess: false, message: "User not found" };
  },

  setPlayerConnection: (connection, playerId) => {
    db.connectionToPlayer.set(connection, playerId);
  },

  clearPlayerConnection: (connection) => {
    const playerId = db.connectionToPlayer.get(connection);
    if (playerId !== undefined) {
      const player = db._db.find((p) => p.id === playerId);
      if (player) player.online = false;
      db.connectionToPlayer.delete(connection);
    }
  },

  createRoom: (playerId) => {
    db.roomCounter += 1;
    const player = db._db.find((p) => p.id === playerId);
    if (!player) throw new Error("Player not found");

    const newRoom: ROOM = {
      roomId: db.roomCounter,
      players: [player], // Start with the creator
    };
    db.rooms.set(newRoom.roomId, newRoom);
    return { roomId: newRoom.roomId };
  },

  addUserToRoom: (roomId, playerId) => {
    const room = db.rooms.get(roomId);
    const player = db._db.find((p) => p.id === playerId);

    if (!room || !player) {
      return { isSuccess: false, message: "Room or player not found" };
    }
    if (db.isPlayerInRoom(roomId, playerId)) {
      return { isSuccess: false, message: "Player is already in the room" };
    }

    room.players.push(player);
    return { isSuccess: true, message: "Player added to room" };
  },

  isPlayerInRoom: (roomId: number, playerId: number): boolean => {
    const room = db.rooms.get(roomId);
    return room ? room.players.some((player) => player.id === playerId) : false;
  },

  getPlayers: () => {
    return [...db._db];
  },
};
