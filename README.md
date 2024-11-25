# LIVE-CHAT

## Chat App con Node.js y WebSockets

Esta aplicación es un servidor y cliente de chat desarrollado con **Node.js**, **Express**, y **Socket.IO**, que permite a los usuarios interactuar en tiempo real a través de WebSockets. Los mensajes y los usuarios se gestionan en una base de datos SQLite utilizando `@libsql/client`.

## Características

1. **Servidor WebSocket**: Maneja conexiones en tiempo real entre múltiples usuarios.
2. **Gestión de usuarios**: Cada usuario tiene un nombre único y se le asigna un color aleatorio.
3. **Persistencia de mensajes**: Los mensajes se almacenan en una base de datos para que estén disponibles incluso tras reinicios del servidor.
4. **Recuperación de estado**: Los nuevos clientes pueden recuperar mensajes históricos al conectarse.
5. **Base de datos SQLite**: Gestión de usuarios y mensajes mediante tablas relacionales.
6. **Gestión de desconexiones**: Resetea las tablas de la base de datos si no hay usuarios conectados.

## Requisitos previos

- **Node.js** v16 o superior.
- **npm** (incluido con Node.js).
- **Base de datos SQLite** o su variante proporcionada por `@libsql/client`.
- Configuración del archivo `.env` para las credenciales del servidor de la base de datos.
# LiveChat
