import express from "express";
import logger from "morgan";
import dotenv from 'dotenv'


import {createClient} from '@libsql/client'
import {Server} from 'socket.io'
import {createServer} from 'node:http' 


//Utilizacion del archivo .nev
dotenv.config()

//Declaracion del puerto
const port = process.env.PORT ?? 3000

//Declaracion de la App
const app = express()

//Declaracion del servidor que utiliza la app
const server = createServer(app)

//Declaracion del io que es vasicamente el Socket que le manda a todo el mundo
const io = new Server(server, {
    connectionStateRecovery: {
        maxDisconnectionDuration: 5000,
        skipMiddlewares:true
    }
})

//Conexion con la Base de Datos
const db = createClient({
    url:"libsql://still-multiple-man-franciscoannoni.turso.io",
    authToken: process.env.DB_TOKEN
})
// esto no m e funca
/*
await db.execute(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        content TEXT
        )
    `)
*/
    
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

app.use(logger('dev')) //Una extencion que nos logea las cosas al pedo pero sirve para codear

app.get('/',(req,res)=>{
    res.sendFile(process.cwd() + '/cliente/index.html')
})

server.listen(port, () => {
    console.log(`server esta activo y escuchando en puerto *:${port}`)
})


// Funcion que utilizo para crear los colores claros para el Chat
function getRandomColor() {
    const letters = 'CDEF'; // Rango de letras para colores claros
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
  }