const express=require('express');
const {Server}=require('socket.io');
const http=require('http');
const { createSocket } = require('dgram');

const app=express();
const httpServer=http.createServer(app);
const io=new Server(httpServer);

const PORT= process.env.PORT || 3000;

app.use(express.static(__dirname ));

httpServer.listen(PORT,()=>{
    console.log('server running on port',PORT);
})
app.get("/",(req,res)=>{
    res.sendFile(__dirname+"/index.html");
});


io.on('connection',(socket)=>{
    console.log("connected");
    socket.on('offer',(data)=>{
        socket.broadcast.emit('offer',data);
        //console.log("offer is brodcasted");
    })
    socket.on('answer',(data)=>{
        socket.broadcast.emit('answer',data);
        //console.log("answer is brodcasted");
    })
    socket.on('ice-candidate',(data)=>{
        //console.log("broadcasting icecan");
        socket.broadcast.emit('ice-candidate',data);
    })
    socket.on('userLeft',()=>{
        socket.broadcast.emit('userLeft');
    })
});