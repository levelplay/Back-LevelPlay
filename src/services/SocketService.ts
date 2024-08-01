import { DisconnectReason, Socket } from "socket.io";
import RefrachTokenModel from "../schema/RefrachTokenModel";
import UsersModel from "../schema/UsersModel";
import WinModel from "../schema/WinModel";
import ChatModel from "../schema/ChatModel";

type connectedUsers = {
  client: Socket,
  clientId: string,
  email?: string,
  username?: string
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
    socket.on('reject', (data)=> this.reject(socket.id, data));
    socket.on('turn', (data)=> this.turn(socket.id, data));
    socket.on('quit', (data)=> this.quit(socket.id));
    socket.on('chat', (data)=> this.chat(socket.id, data));
    socket.on('disconnect', (reson: DisconnectReason, description: any) => this.disconnected(socket.id));
    let email = ''
    let username = ''
    if (socket.handshake.auth.token && socket.handshake.auth.token != '') {
      const token = await RefrachTokenModel.findOne({token: socket.handshake.auth.token});
      if(token){
        const user = await UsersModel.findById(token.userId);
        email = user?.email || '';
        username = user?.username || '';
      }
    }
    if(email!= ''){
      this.connectedUsers = this.connectedUsers.filter(e=> e.email != email);
    }
    this.connectedUsers.push({ email, clientId: socket.id, client: socket, username });
    console.log(this.connectedUsers.map(e=> e.email));
  }
  disconnected(id: string) {
    const client = this.connectedUsers.find(e=> e.clientId == id);
    const filter = this.connectedUsers.filter(e=> e.clientId != id && e.email != client?.email );
    this.connectedUsers = filter;
    const gameFilters = this.waitingUser.filter(e=> e.player1.clientId != id && (e.player2 == null || e.player2.clientId != id));
    this.waitingUser = gameFilters;
  }
  async chat(id: string, data: any){
    const client = this.connectedUsers.find(e=> e.clientId == id);
    const otherUser = this.connectedUsers.find(e=> e.email == data?.email );
    if(client){
      const findUser = await UsersModel.findOne({ email: client?.email  });
      if(findUser){
        const newChat = new ChatModel({ receiverId:data.id, senderId: findUser?.id, message: data.message  });
        newChat.save();
        const chat = await ChatModel.findById(newChat.id);
        if( otherUser && chat ){
          otherUser.client.emit('newChat', chat?.toJSON());
        }
      }
    }
  }
  async quit(id: string){
    const otherClient = this.tiktakTok.find((e)=> e.player1.clientId == id || e.player2?.clientId == id);
    if(otherClient){
      if(otherClient.player1.clientId == id){
        otherClient?.player2?.client.emit('gameWin', '' );
        const user = await UsersModel.findOne({email:  otherClient?.player2?.email });
        if(user){
          await UsersModel.updateOne({_id: user._id}, {$set: {win: (user.win || 0) + 1}});
        }
      }else{
        otherClient?.player1?.client.emit('gameWin', '' );
        const user = await UsersModel.findOne({email:  otherClient?.player1?.email });
        if(user){
          await UsersModel.updateOne({_id: user._id}, {$set: {win: (user.win || 0) + 1}});
        }
      }
      const index = this.tiktakTok.indexOf(otherClient);
      this.tiktakTok.slice(index, 1);
    }
  }
  reject(id: string,data: string){
    const client = this.connectedUsers.find(e=> e.clientId == id);
    if(!client){
      return;
    }
    const users =  this.waitingUser.find(e=> e.player2?.clientId == id);
    users?.player1.client.emit('error', 'User rejected');
    const newList = this.waitingUser.filter(e=> e.player1.clientId != id &&  e.player2?.clientId != id);
    this.waitingUser = newList;
  }
  async addEmail(id: string,  data: string) {
    const result = JSON.parse(data);
    let email = ''
    let username = ''
    if (result.token && result.token != '') {
      const token = await RefrachTokenModel.findOne({token: result.token});
      if(token){
        const user = await UsersModel.findById(token.userId);
        email = user?.email || '';
        username = user?.username || '';
      }
    }
    this.connectedUsers = this.connectedUsers.filter(e=> e.email != result.email);
    this.connectedUsers.map(e=> {
      if(e.clientId == id){
        console.log(e);
        e.email = email;
        e.username = username;
        console.log(e);
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
      const runningGame =this.tiktakTok.find(e=> e.player1.email == res.user && e.player2?.email == client.email);
      if(runningGame){
        client?.client.emit('error', 'Alredy in Game');
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
      otherClient.player1.client.emit('start-tiktakTok', `player=player1&username=${client.username}&email=${client.email}`);
      client.client.emit('start-tiktakTok', `player=player2&email=${otherClient.player1.email}&username=${otherClient.player1.username}`);
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
      if(res.turn == 1){
        otherClient?.player2?.client.emit('gameRes', JSON.stringify({ data: res.data, turn: 2 }) );
      }else{
        otherClient?.player1?.client.emit('gameRes', JSON.stringify({ data: res.data, turn: 1 }) );
      }
      if(win){
        if(res.turn == 1){
          otherClient?.player1?.client.emit('gameWin', '' );
          otherClient?.player2?.client.emit('gameLose', '' );
          const user = await UsersModel.findOne({email:  otherClient?.player1.email});
          if(user){
            await UsersModel.updateOne({_id: user._id}, {$set: {win: (user.win || 0) + 1, tempWin: (user.tempWin || 0) + 1}});
          }
        }else{
          otherClient?.player2?.client.emit('gameWin', '' );
          otherClient?.player1?.client.emit('gameLose', '' );
          const user = await UsersModel.findOne({email:  otherClient?.player2?.email });
          if(user){
            await UsersModel.updateOne({_id: user._id}, {$set: {win: (user.win || 0) + 1, tempWin: (user.tempWin || 0) + 1}});
          }
        }
        this.tiktakTok.splice(index, 1);
      }
  }
  async addToWatingListOrCreateRoom(id: string,  data: string) {
    const res = JSON.parse(data);
    const client = this.connectedUsers.find(e=> e.clientId == id);
    if(!client){
      return;
    }
    if(res.user && res.user != '' ){
      const user = await UsersModel.findOne({username: res.user});
      if(!user){
        client?.client.emit('error', 'User not Found');
        return;
      }
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
    this.waitingUser =  this.waitingUser.filter(e=> e.player1.clientId != single.player1.clientId);
    this.tiktakTok.push({
      player1: single.player1,
      player2: client,
      data: []
    });
    single.player1.client.emit('start-tiktakTok', `player=player1&username=${client.username}&email=${client.email}`);
    client.client.emit('start-tiktakTok', `player=player2&username=${single.player1.username}&email=${single.player1.email}`);
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
