module.exports = function(server) {
  const io = require('socket.io')(server);
  const p2p = require('socket.io-p2p-server').Server;
  io.use(p2p);
}