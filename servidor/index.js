import express from "express";
import logger from "morgan";
import dotenv from 'dotenv'


import {createClient} from '@libsql/client'
import {Server} from 'socket.io'
import {createServer} from 'node:http' 


//Utilizacion del archivo .nev
dotenv.config()

//conexiones Activas
let connectionctive = 0;

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
    url:'libsql://still-multiple-man-franciscoannoni.turso.io',
    authToken: process.env.DB_TOKEN
})


// Crear tabla de usuarios si no existe
await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT UNIQUE,
        color TEXT
    )
`)

// Crear tabla de mensajes si no existe
await db.execute(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT,
        userName TEXT,
        userColor TEXT,
         user_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
`)
    
io.on('connection', async (socket) =>
{
    connectionctive++;

    const userName = socket.handshake.auth.nombre; 
    console.log('-------------------------------')
    console.log('================================')
    
    console.log('a user has connected!')
    console.log('gente conectada: ' + connectionctive);

    let userColor = await getUserColor(userName);

    if (!userColor) {
        // Si no tiene color, asignar uno nuevo
        userColor = getRandomColor();
        await assignColorToUser(userName, userColor);
    }

    socket.on('disconnect', () => {
        console.log('an user has disconnected')
        console.log(`Usuario desconectado: ${userName}`);
        io.emit('chat message', { nombre: "App ", text: `Se desconecto ${userName}`, color: '#D3D3D3', database: ''});

        connectionctive--;

        console.log('gente conectada: ' + connectionctive);

        if(connectionctive == 0 ){
        resetAndRecreateTables(db)
        console.log('Se reseteo la base correctamente');
        }
    })
    console.log('================================')
 
    socket.on('chat message', async (msg) => {
        let result
        try {
            const userId = await getUserId(userName);
            const userColor = await getUserColor(userName);
           // Insertar mensaje en la base de datos
            result = await db.execute({
                sql: `INSERT INTO messages (content, user_id, userName, userColor) VALUES (:msg, :userId, :userName, :userColor)`,
                args: { msg, userId, userName, userColor }
            })
        } catch (e){
            console.error(e)
            return
        }

        io.emit('chat message', { nombre: userName, text: msg, color: userColor, database: result.lastInsertRowid.toString()});

        console.log('message: ' + msg);
       
      });

      if(!socket.recovered) {
        try {
            const results = await db.execute({
                sql: 'SELECT id, content, userName, userColor FROM messages WHERE id > ?',
                args: [socket.handshake.auth.serverOffset ?? 0]
            })

            results.rows.forEach(row => {
                socket.emit('chat message', { nombre: row.userName, text: row.content, color: row.userColor, database: row.id.toString()} ) 
            })
        }
        catch (e){
            console.error(e);
        }
      }
 
})

app.use(logger('dev')) //Una extencion que nos logea las cosas al pedo pero sirve para codear


app.get('/',(req,res)=>{
    res.sendFile(process.cwd() + '/cliente/index2.html')
})

app.get('/chat',(req,res)=>{
    const nombre = req.query.nombre; // Obtiene el nombre de los parámetros de consulta
    
    if (!nombre) {
        // Si no hay nombre, redirige a la página principal
        return res.redirect('/');
    }

    console.log('Nombre del usuario:', nombre);
    res.sendFile(process.cwd() + '/cliente/index.html')
})



server.listen(port, () => {
    console.log(`server esta activo y escuchando en puerto *:${port}`)
})


//---------------------------------------------------------------
//===============================================================
async function resetAndRecreateTables(db) {
    try {
        // Eliminar tabla de mensajes
        await db.execute(`DROP TABLE IF EXISTS messages;`);
        console.log("Tabla 'messages' eliminada.");

        // Eliminar tabla de usuarios
        await db.execute(`DROP TABLE IF EXISTS users;`);
        console.log("Tabla 'users' eliminada.");

        // Crear tabla de usuarios
        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT UNIQUE,
                color TEXT
            )
        `);
        console.log("Tabla 'users' creada.");

        // Crear tabla de mensajes
        await db.execute(`
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT,
                userName TEXT,
                userColor TEXT,
                user_id INTEGER,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);
        console.log("Tabla 'messages' creada.");
    } catch (error) {
        console.error("Error al reiniciar y recrear las tablas:", error);
    }
}


//Funcion para obtener el color de usuario desde la base de datos
async function getUserColor(userName) {
    const result = await db.execute({
        sql: 'SELECT color FROM users WHERE nombre = ?',
        args: [userName]
    });
    return result.rows[0] ? result.rows[0].color : null;
}

//Funcion para obtener el color de usuario desde la base de datos
async function getUserColorID(id) {
    const result = await db.execute({
        sql: 'SELECT color FROM users WHERE id = ?',
        args: [id]
    });
    return result.rows[0] ? result.rows[0].color : null;
}

// Función que asigna un color al usuario en la base de datos
async function assignColorToUser(userName, color) {
    await db.execute({
        sql: 'INSERT INTO users (nombre, color) VALUES (:nombre, :color)',
        args: { nombre: userName, color }
    });
}

// Función que obtiene el ID del usuario
async function getUserId(userName) {
    const result = await db.execute({
        sql: 'SELECT id FROM users WHERE nombre = ?',
        args: [userName]
    });
    return result.rows[0] ? result.rows[0].id : null;
}

// Función que obtiene el nombre del usuario desde su ID
async function getUserName(id) {
    const result = await db.execute({
        sql: 'SELECT nombre FROM users WHERE id = ?',
        args: [id]
    });
    return result.rows[0] ? result.rows[0].id : null;
}

// Funcion que utilizo para crear los colores claros para el Chat
function getRandomColor() {
    const letters = 'CDEF'; // Rango de letras para colores claros
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
  }