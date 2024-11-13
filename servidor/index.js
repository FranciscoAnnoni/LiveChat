import express from "express";
import logger from "morgan";

const port = process.env.PORT ?? 3000

const app = express()
app.use(logger('dev'))

app.get('/',(req,res)=>{
    res.sendFile(process.cwd() + '/cliente/index.html')
})

app.listen(port, () => {
    console.log('server esta activo y escuchando en puerto ${port}')
})