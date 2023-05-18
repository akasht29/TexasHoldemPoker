const express = require("express");
const router = express.Router();
const db = require("../database/connection");

router.post("/:id", async (request, response) => {
  const io = request.app.get("io");
  const { message } = request.body;
  const userId = request.session.user.user_id;
  const username = request.session.user.username;

  const value = parseInt(userId, 10);
  const query = `SELECT game_id FROM players WHERE user_id = ${userId}`;
  const result = await db.one(query, [value]);
  const roomId = parseInt(result.game_id);

  io.in(roomId).emit("CHAT_MESSAGE", {
    username,
    message,
  });

  response.status(204);
});

module.exports = router;
