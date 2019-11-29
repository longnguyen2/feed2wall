const express = require('express');
const router = express.Router();

const { getInstagramPosts } = require('../crawlers');

router.get('/', async (req, res) => {
  const { id, queryName, type, total } = req.query;
  if (!queryName && !id) {
    res.status(400).end('Bad request');
  } else {
    try {
      const data = await getInstagramPosts(id, { queryName, type, total });
      res.send(data);
    } catch (e) {
      console.error(e);
      res.status(500).end('Internal server error');
    }
  }
});

module.exports = router;