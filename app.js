const express = require('express');
const app = express();

const { getInstagramPosts } = require('./crawlers');

app.get('/instagram', async (req, res) => {
  const { id, queryName, type, total, endCursor } = req.query;
  if (!(queryName || type || total)) {
    res.status(400).end('Bad request');
  // } else if (id ^ endCursor) { // xor condition
  //   res.status(400).end('Bad request');
  } else {
    try {
      const data = await getInstagramPosts(id, queryName, {type, total, endCursor});
      res.send(data);
    } catch (e) {
      console.error(e);
      res.status(500).end('Internal server error');
    }
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('App is listen at port ' + port));