//========== MODULES ==========//

//express module
const express = require('express');
const app = express();

//server
const server = require('http').Server(app);
//sockets module
const io = require('socket.io')(server);

//my custom middleware module
const middleware = require('./middleware');



//=========== MIDDLEWARE ==========//

//middleware for using pug with express
app.set('view engine', 'pug');

//middleware for serving static files
app.use(express.static('public'));

//apply middleware to index route
app.get('/', [middleware.getTweets, middleware.getFriends, middleware.getMessages, middleware.getSentMessages, middleware.createConvo]);



//============= ROUTES ==============//

//render index template with variables from twitter api request
app.get('/', function(req,res) {

  //VARIABLES
  const name = res.locals.name;
  const username = res.locals.username;
  const profilePic = res.locals.profilePic;
  const background = res.locals.background;
  const following = res.locals.following;
  const friends = res.locals.friends;
  const convos = res.locals.convos;
  const tweets = res.locals.tweets;

  //RENDERING
  res.render('index', {name, username, profilePic, tweets, friends, convos});

  //open a web socket
  io.on('connection', function(socket) {
    console.log('A client is connected');

    socket.on('message', function(message){
      middleware.postTweet(message);
      socket.emit('tweet', {name, username, profilePic});
    });

  });
});


//=========== ERRORS ===========//

app.use((req, res, next) => {
  let err = new Error("Page Not Found");
  err.status = 404;
  next(err);
});

app.use((req, res, next) => {
  let err = new Error("Internal Server Error");
  err.status = 500;
  next(err);
});

app.use((err, req, res, next) => {
  res.locals.error = err;
  res.status(err.status);
  res.render('error')
});


//========= SERVER =========//

//listen for server
server.listen(3000, function() {
  console.log("Server up and running on port 3000");
});
