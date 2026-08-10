// resourceRoutes.js
// Builds an Express router for a JSON-blob resource (subjects, tasks, etc.)
// using the shared resourceController factory.

const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { createResourceController } = require('../controllers/resourceController');

function createResourceRouter(tableName) {
  const router = express.Router();
  const { list, create, update, remove } = createResourceController(tableName);

  router.use(requireAuth);

  router.get('/', list);
  router.post('/', create);
  router.put('/:id', update);
  router.delete('/:id', remove);

  return router;
}

module.exports = { createResourceRouter };
