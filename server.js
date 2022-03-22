const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const cors = require('cors');
const app = express();
const uuid = require('uuid-random');

app.use(cors());
var http = require('http').createServer(app);

var io = require('socket.io')(http, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
var session_users = [];
var that = this;
var next_count = 1;
io.on('connection', (socket) => {
  console.log('User Online');

  socket.on('canvas-data', (data) => {
    socket.broadcast.emit('canvas-data', data);
  });
  socket.on('add-user', (data) => {
    //console.log('users ' + that.session_users);
    var user_added = {};
    user_added.name = data;
    user_added.id = uuid();
    io.emit('user-added', user_added);
  });
  socket.on('connect-student', (data) => {
    console.log('in server: ' + data);
    io.emit('connect-student', data);
  });
});

// Connect Database
connectDB();

// Init Middleware
app.use(express.json());

// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
http.listen(8080, () => {
  console.log('Started on : 8080');
});
