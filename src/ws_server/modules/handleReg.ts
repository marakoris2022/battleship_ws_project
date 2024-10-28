import { WebSocket } from "ws";
import { db } from "../db/db.ts";

export function handleReg(
  connection: WebSocket,
  requestData: { name: string; password: string }
) {
  const result = db.addPlayer(requestData.name, requestData.password);

  if (result.isSuccess && result.playerId !== undefined) {
    db.setPlayerConnection(connection, result.playerId);
  }

  connection.send(
    JSON.stringify({
      type: "reg",
      data: JSON.stringify({
        name: requestData.name,
        index: result.isSuccess ? db.getPlayers().length - 1 : null,
        error: !result.isSuccess,
        errorText: result.isSuccess ? "" : result.message,
      }),
      id: 0,
    })
  );
}
