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
    socket.on('challenge', (data)=> this.challenge(socket.id, data));
    socket.on('turn', (data)=> this.turn(socket.id, data));
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
    const gameFilters = this.waitingUser.filter(e=> e.player1.clientId != id && (e.player2 == null || e.player2.clientId != id));
    this.waitingUser = gameFilters;
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
  async challenge(id: string,  data: string){
    const res = JSON.parse(data);
    const client = this.connectedUsers.find(e=> e.clientId == id);
    if(!client){
      return;
    }
    if(res.user && res.user != '' ){
      const otherClient = this.waitingUser.find(e=> e.player1.email == res.user && e.player2?.email == client.email );
      if(!otherClient){
        client?.client.emit('error', 'User not Found');
        return;
      }
      if(res.accept == false){
        const index = this.waitingUser.indexOf(otherClient);
        if(index > -1){
          this.waitingUser.splice(index, 1);
        }
        otherClient.player1.client.emit('error', 'User Reject');
        return;
      }
      const index = this.waitingUser.indexOf(otherClient);
      if(index > -1){
        this.waitingUser.splice(index, 1);
      }
      this.tiktakTok.push({
        player1: otherClient.player1,
        player2: otherClient.player2,
        data: []
      });
      otherClient.player1.client.emit('start-tiktakTok', 'player1');
      client.client.emit('start-tiktakTok', 'player2');
    }
  }
  async turn(id: string,  data: string){
    const res = JSON.parse(data);
    const client = this.connectedUsers.find(e=> e.clientId == id);
      const otherClient = this.tiktakTok.find(e=> e.player1.clientId == id ||  e.player2?.clientId == id);
      if(!otherClient){
        client?.client.emit('error', 'User not Found');
        return ;
      }
      const index = this.tiktakTok.indexOf(otherClient);
      this.tiktakTok[index].data = res.data;
      const win = playerWin(this.tiktakTok[index].data, res.turn);
      console.log(this.tiktakTok[index].data, res.turn, win);
      if(res.turn == 1){
        otherClient?.player2?.client.emit('gameRes', JSON.stringify({ data: res.data, turn: 2 }) );
      }else{
        otherClient?.player1?.client.emit('gameRes', JSON.stringify({ data: res.data, turn: 1 }) );
      }
      if(win){
        if(res.turn == 1){
          otherClient?.player1?.client.emit('gameWin', '' );
          otherClient?.player2?.client.emit('gameLose', '' );
          const user = await UsersModel.findOne({email:  otherClient?.player1.email });
          if(user){
            await UsersModel.updateOne({_id: user._id}, {$set: {win: (user.win || 0) + 1}});
          }
        }else{
          otherClient?.player2?.client.emit('gameWin', '' );
          otherClient?.player1?.client.emit('gameLose', '' );
          const user = await UsersModel.findOne({email:  otherClient?.player2?.email });
          if(user){
            await UsersModel.updateOne({_id: user._id}, {$set: {win: (user.win || 0) + 1}});
          }
        }
        this.tiktakTok.splice(index, 1);
      }
  }
  async addToWatingListOrCreateRoom(id: string,  data: string) {
    const res = JSON.parse(data);
    const client = this.connectedUsers.find(e=> e.clientId == id);
    console.log(client);
    if(!client){
      return;
    }
    console.log(res.user);
    if(res.user && res.user != '' ){
      const user = await UsersModel.findOne({username: res.user});
      if(!user){
        client?.client.emit('error', 'User not Found');
        return;
      }
      console.log( this.connectedUsers.map(e=> e.email));
      const otherClient = this.connectedUsers.find(e=> e.email == user.email);
      if(!otherClient){
        client?.client.emit('error', 'User not Found');
        return ;
      }
      otherClient.client.emit('gameChallenge', client?.email);
      this.waitingUser.push({player1: client, player2: otherClient});
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

const playerWin = (moves: number[][], player: number) => {
  if (moves[0][0] == player && moves[0][1] == player && moves[0][2] == player) {
    return true;
  }
  if (moves[1][0] == player && moves[1][1] == player && moves[1][2] == player) {
    return true;
  }
  if (moves[2][0] == player && moves[2][1] == player && moves[2][2] == player) {
    return true;
  }
  if (moves[0][0] == player && moves[1][0] == player && moves[2][0] == player) {
    return true;
  }
  if (moves[0][1] == player && moves[1][1] == player && moves[2][1] == player) {
    return true;
  }
  if (moves[0][2] == player && moves[1][2] == player && moves[2][2] == player) {
    return true;
  }
  if (moves[0][0] == player && moves[1][1] == player && moves[2][2] == player) {
    return true;
  }
  if (moves[0][2] == player && moves[1][1] == player && moves[2][0] == player) {
    return true;
  }
  return false;
};
