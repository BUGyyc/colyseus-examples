import { Room, Client } from "colyseus";

export class GameRoom extends Room {
    seed: number = 0;

    FRAME_RATE: number = 20;
    frame_index: number = 0;
    frame_interval: any = null;
    frame_list: any[] = [[]];
    frame_acc: number = 3;

    actors: Map<string, any> = new Map();

    maxClients = 20;


    // When room is initialized
    // onInit(options: any) {
    //     console.log("server onInit ---- ");
    //     this.frame_index = 0;
    //     this.seed = Math.round(Math.random() * 1000000000);
    //     this.frame_interval = setInterval(this.tick.bind(this), 1000 / this.FRAME_RATE);
    //     this.frame_list = [];
    // }

    onCreate (options: any){
        console.log("server onCreate ---- ");
        this.frame_index = 0;
        this.seed = Math.round(Math.random() * 1000000000);
        this.frame_interval = setInterval(this.tick.bind(this), 1000 / this.FRAME_RATE);
        this.frame_list = [];
    }

    getFrameByIndex(index) {
        if (this.frame_list[index] === undefined) {
            this.frame_list[index] = [];
        }
        return this.frame_list[index];
    }

    
    tick() {
        console.log("server tick---------------- ");
        let frames = [];
        frames.push([this.frame_index, this.getFrameByIndex(this.frame_index)]);
        // console.log("server 广播 ---- ", frames);
        this.broadcast(["f", frames]);
        this.frame_index += this.frame_acc;
    }

    // Checks if a new client is allowed to join. (default: `return true`)
    requestJoin(options: any, isNew: boolean) {
        return true;
    }


    // When client successfully join the room
    onJoin(client: Client) {
        console.log("client join    ", client.sessionId);
        this.broadcast(`${client.sessionId} joined.`);
    }

    // When a client leaves the room
    onLeave(client: Client, consented: boolean) {
        console.log("client onLeave    ", client.sessionId);
        this.broadcast(`${client.sessionId} left.`);
    }

    // When a client sends a message
    onMessage(client: Client, message: any) {
        switch (message[0]) {
            case "cmd":
                this.onCmd(client, message);
                break;
            case "fs":
                this.onGetAllFrames(client, message);
                break;
            default:
                console.log("接收到未处理的message:")
                console.log(message)
                break;
        }
    }

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose() {
        clearInterval(this.frame_interval);
        console.log("Dispose IOGRoom");
    }


    //当收到用户的输入，存入frame_list
    onCmd(client: Client, message: any) {
        if (message[0] == "cmd" && message[1][0] == "addplayer") {
        }
        this.frame_list_push([client.sessionId, message[1]]);
    }

    onGetAllFrames(client: Client, message: any) {
        let frames = [];
        for (let i = 0, len = this.frame_list.length; i < len; i++) {
            if (this.frame_list[i] !== undefined) {
                frames.push([i, this.frame_list[i]]);
            }
        }
        if (frames.length == 0) {
            frames = [[0, []]];
        }
        this.send(client, ["fs", frames])
    }

    frame_list_push(data: any) {
        //每帧数据都塞进去
        // console.log("frame_list   push ", data);
        if (this.frame_list[this.frame_index] == undefined) {
            this.frame_list[this.frame_index] = [];
        }
        this.frame_list[this.frame_index].push(data);
    }

}
