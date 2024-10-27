import { WebSocketServer } from "ws";

const WS_PORT = 3000;

const ws = new WebSocketServer({ port: WS_PORT });
console.log(`WebSocketServer is up on the ${WS_PORT} port!`);

ws.on("connection", (connection, request) => {
  console.log("We have a connection");

  connection.on("message", (data) => {
    console.log("data", JSON.parse(data.toString()));
    const dataFromClient = JSON.parse(data.toString());
    const requestType = dataFromClient.type;
    const requestData = JSON.parse(dataFromClient.data);

    connection.send(
      JSON.stringify({
        type: "reg",
        data: JSON.stringify({
          name: requestData.name,
          index: 0,
          error: false,
          errorText: "",
        }),
        id: 0,
      })
    );
  });

  connection.on("close", () => {
    console.log("closed");
  });
});

ws.on("error", (error) => {
  console.error("WebSocket error:", error);
});
