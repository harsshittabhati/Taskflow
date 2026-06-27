const express = require('express');
const router = express.Router();
const {
  getBoards,
  createBoard,
  getBoard,
  updateBoard,
  deleteBoard,
} = require('../controllers/boardController');
const authMiddleware = require('../middleware/auth');

// All board routes are protected
router.use(authMiddleware);

router.get('/', getBoards);
router.post('/', createBoard);
router.get('/:id', getBoard);
router.put('/:id', updateBoard);
router.delete('/:id', deleteBoard);

module.exports = router;