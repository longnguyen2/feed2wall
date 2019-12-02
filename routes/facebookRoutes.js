const express = require('express');
const router = express.Router();

const { getFacebookPosts } = require('../crawlers');

router.get('/', async (req, res) => {
  const { id, query, total } = req.query;
  if (!query && !id) {
    res.status(400).end('Bad request');
  } else {
    try {
      const data = await getFacebookPosts(id, { query, total });
      res.send(data);
    } catch (e) {
      console.error(e);
      res.status(500).end('Internal server error');
    }
  }
});

module.exports = router;