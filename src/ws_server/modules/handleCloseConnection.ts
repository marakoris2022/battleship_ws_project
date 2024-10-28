import { WebSocket } from "ws";
import { db } from "../db/db.ts";

export function handleCloseConnection(connection: WebSocket) {
  db.clearPlayerConnection(connection);
}
