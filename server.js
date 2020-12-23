const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
var fs = require("fs")
const users = []

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/join', (req, res) =>{
  res.render('join')
})

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  console.log(socket.id + " is connected.");
  socket.on('peerid', id =>{
    socket.emit('peerid', id)
  })
  socket.on('login', username =>{
    if(users.indexOf(username)>=0){
      socket.emit("login-fail");
    }
    else{
      users.push(username)
      socket.user = username
      socket.emit("login-sucess", users)
    }
  })
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    console.log(socket.rooms)
    socket.to(roomId).broadcast.emit('user-connected', {
      userId: userId,
      roomId: roomId,
      name: users
    })

    socket.on('disconnect', () => {
      users.splice(users.indexOf(socket.user),1)
      socket.to(roomId).broadcast.emit('user-disconnected', {
        userId: userId,
        name: users
      })
    })
    socket.on("sendMessage", function(data){
      console.log(socket.id + "send massage: " + data);
      io.sockets.emit("serverSend", {
        name: socket.user,
        mess: data
      });
    });
    socket.on("sendPhoto", function(data){
      //console.log(data);
      var guess = data.base64.match(/^data:image\/(png|jpeg);base64,/)[1];
      var ext = "";
      switch(guess) {
        case "png"  : ext = ".png"; break;
        case "jpeg" : ext = ".jpg"; break;
        default     : ext = ".bin"; break;
      }
      var savedFilename = "/upload/"+randomString(10)+ext;
      fs.writeFile(__dirname+"/public"+savedFilename, getBase64Image(data.base64), 'base64', function(err) {
        if (err !== null)
          console.log(err);
        else{
          io.sockets.emit("receivePhoto", {
            name: socket.user,
            path: savedFilename,
          });
          console.log(savedFilename);
          console.log("Send photo success!");
        }
      })
    })
  })
})

function randomString(length)
  {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  
      for( var i=0; i < length; i++ )
          text += possible.charAt(Math.floor(Math.random() * possible.length));
  
      return text;
  }
  function getBase64Image(imgData) {
      return imgData.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
  }

server.listen(3000)