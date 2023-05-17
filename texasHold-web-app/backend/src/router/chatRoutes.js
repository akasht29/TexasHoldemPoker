const express = require("express");
const router = express.Router();
const events = require("../../../shared/constants.js");
const gameController   = require('../controllers/gameController');

router.get("/:id", async (request, response) => {
  const io = request.app.get("io");
  const { message } = request.body;
  const userId = request.session.user.user_id;
  const username = request.session.user.username;

  const gameId = gameController.getGameIdByUserId(userId)

  io.to(gameId).emit(events.CHAT_MESSAGE, {
    username, message
  });

  response.status(200);
});

module.exports = router;