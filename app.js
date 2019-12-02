const express = require('express');
const app = express();
const server = require('http').createServer(app);

const cors = require('cors');
app.use(cors());

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const instagramRoutes = require('./routes/instagramRoutes');
app.use('/instagram', instagramRoutes);

const twitterRoutes = require('./routes/twitterRoutes');
app.use('/twitter', twitterRoutes);

const facebookRoutes = require('./routes/facebookRoutes');
app.use('/facebook', facebookRoutes);

const webConfigRoutes = require('./routes/webConfigRoutes');
app.use('/config', webConfigRoutes);

require('./socketIo')(server);

const port = process.env.PORT || 3000;
server.listen(port, () => console.log('App is listen at port ' + port));