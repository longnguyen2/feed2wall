const events = [
  'app:get-config',
  'app:change-config',
  'client:send-config',
];

module.exports = function(server) {
  const io = require('socket.io')(server);
  io.on('connection', (socket) => {
    console.log(socket.id + ' connected');
    io.sockets.clients((er, clients) => console.log('total ' + clients.length));

    events.forEach((e) => socket.on(e, (data) => {
      console.log('event ' + e);
      console.log('data ' + JSON.stringify(data));
      socket.broadcast.emit(e, data);
    }));
  });
}