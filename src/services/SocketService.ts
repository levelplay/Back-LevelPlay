import { DisconnectReason, Socket } from "socket.io";
import RefrachTokenModel from "../schema/RefrachTokenModel";
import UsersModel from "../schema/UsersModel";

type connectedUsers = {
  client: Socket,
  clientId: string,
  email?: string,
};
type watingList = {
  player1: connectedUsers,
  player2: connectedUsers | null
}
type tiktakTok = {
  player1: connectedUsers,
  player2: connectedUsers | null,
  data: any
}
export class SocketService {
  connectedUsers: connectedUsers[] = [];
  waitingUser: watingList[] = [];
  tiktakTok: tiktakTok[] = [];
  async connented(socket: Socket) {
    socket.on('addEmail', (data)=> this.addEmail(socket.id, data));
    socket.on('pair', (data)=> this.addToWatingListOrCreateRoom(socket.id, data));
    socket.on('disconnect', (reson: DisconnectReason, description: any) => this.disconnected(socket.id));
    let email = ''
    if (socket.handshake.auth.token && socket.handshake.auth.token != '') {
      const token = await RefrachTokenModel.findOne({token: socket.handshake.auth.token});
      if(token){
        const user = await UsersModel.findById(token.userId);
        email = user?.email || '';
      }
    }
    this.connectedUsers.push({ email, clientId: socket.id, client: socket });
  }
  disconnected(id: string) {
    const filter = this.connectedUsers.filter(e=> e.clientId != id);
    this.connectedUsers = filter;
  }

  async addEmail(id: string,  data: string) {
    const result = JSON.parse(data);
    let email = ''
    if (result.token && result.token != '') {
      const token = await RefrachTokenModel.findOne({token: result.token});
      if(token){
        const user = await UsersModel.findById(token.userId);
        email = user?.email || '';
      }
    }
    this.connectedUsers.map(e=> {
      if(e.clientId == id){
        e.email = result.email
      }
    });
  }

  async addToWatingListOrCreateRoom(id: string,  data: string) {
    console.log(id, data);
    const res = JSON.parse(data);
    const client = this.connectedUsers.find(e=> e.clientId == id);
    if(!client){
      return;
    }
    if(res.user && res.user != '' ){
      const user = await UsersModel.findOne({username: res.user});
      console.log(user);
      if(!user){
        client?.client.emit('error', 'User not Found');
        return ;
      }
      console.log( this.connectedUsers.map(e=> e.email));
      const otherClient = this.connectedUsers.find(e=> e.email == user.email);
      if(!otherClient){
        client?.client.emit('error', 'User not Found');
        return ;
      }
      otherClient.client.emit('gameChallenge', client?.email);
      this.waitingUser.push({player1: client, player2: otherClient});
      console.log(this.waitingUser.length, 'this.waitingUser');
      return;
    }
    const single = this.waitingUser.find(e=> e.player2 == null && e.player1.email != client.email );
    if(!single){
      const exist = this.waitingUser.find(e=> e.player1.email == client.email || e.player2?.email == client.email);
      if(exist){
        client?.client.emit('error', 'User is Alredy in wating List');
        return;
      }
      this.waitingUser.push({player1: client, player2: null});
      return;
    }

    this.tiktakTok.push({
      player1: single.player1,
      player2: client,
      data: []
    });
    single.player1.client.emit('start-tiktakTok', 'player1');
    client.client.emit('start-tiktakTok', 'player2');
  }
}