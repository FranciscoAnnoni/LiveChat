import express from "express";
import logger from "morgan";

import {Server} from 'socket.io'
import {createServer} from 'node:http' 

const port = process.env.PORT ?? 3000

const app = express()

const server = createServer(app)
const io = new Server(server, {
    connectionStateRecovery: {
        maxDisconnectionDuration: 5000,
        skipMiddlewares:true
    }

})

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }


io.on('connection', (socket) =>
{
    const userColor = getRandomColor();
    console.log('-------------------------------')
    console.log('================================')
    console.log('a user has connected!')

    socket.on('disconnect', () => {
        console.log('an user has disconnected')
    })
    console.log('================================')
 
   
    socket.on('chat message', (msg) => {
        io.emit('chat message', { text: msg, color: userColor });
        console.log('message: ' + msg);
      });
 

})

app.use(logger('dev'))

app.get('/',(req,res)=>{
    res.sendFile(process.cwd() + '/cliente/index.html')
})

server.listen(port, () => {
    console.log(`server esta activo y escuchando en puerto *:${port}`)
})