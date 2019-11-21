const express = require('express');
const app = express();
const server = require('http').createServer(app);

const cors = require('cors');
app.use(cors());

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const instagramRoutes = require('./routes/instagram');
app.use('/instagram', instagramRoutes);

const settingRoutes = require('./routes/setting');
app.use('/setting', settingRoutes);

require('./socketIo')(server);

const port = process.env.PORT || 3000;
server.listen(port, () => console.log('App is listen at port ' + port));