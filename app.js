const express = require('express');
const app     = express();
const { getInstagramPosts } = require('./crawlers');

app.get('/instagram', (req, res) => {
  const { queryName, type, total } = req.query;
  if (!(queryName || type || total)) res.status(400).end('Bad request');
  getInstagramPosts(queryName, { type, total }, (err, promisePosts) => {
    if (err) res.status(400).end(err);
    if (promisePosts) {
      Promise.all(promisePosts)
        .then(posts => res.send(posts))
        .catch(err => res.status(500).end(err));
    }
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('App is listen at port ' + port));