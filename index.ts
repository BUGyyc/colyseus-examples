import path from 'path';
import express from 'express';
import serveIndex from 'serve-index';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'colyseus';
import { monitor } from '@colyseus/monitor';

// Import demo room handlers
import { ChatRoom } from "./rooms/01-chat-room";
import { StateHandlerRoom } from "./rooms/02-state-handler";
import { AuthRoom } from "./rooms/03-auth";

//游戏房间
import { GameRoom } from "./rooms/GameRoom";




const port = Number(process.env.PORT || 2567) + Number(process.env.NODE_APP_INSTANCE || 0);
const app = express();

app.use(cors());
app.use(express.json());


const gameServer = new Server({
  server: createServer(app),
  express: app,
});

gameServer.define("chat", ChatRoom);
gameServer.define("chat_with_options", ChatRoom, {
  custom_options: "you can use me on Room#onCreate"
});
gameServer.define("state_handler", StateHandlerRoom);
gameServer.define("auth", AuthRoom);

//声明游戏房间
gameServer.define('game', GameRoom);


app.use('/', express.static(path.join(__dirname, "static")));
app.use('/', serveIndex(path.join(__dirname, "static"), { 'icons': true }))


app.use('/colyseus', monitor(gameServer));

gameServer.onShutdown(function () {
  console.log(`game server is going down.`);
});

gameServer.listen(port);


console.log(`Listening on http://localhost:${port}`);













