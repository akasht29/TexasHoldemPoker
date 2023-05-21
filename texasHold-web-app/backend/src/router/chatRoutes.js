const express = require("express");
const router = express.Router();

router.post("/:id", async (request, response) => {
  const io = request.app.get("io");
  const { message } = request.body;
  const username = request.session.user.username;
  const game_id = parseInt(request.session.player.game_id);

  io.in(game_id).emit("CHAT_MESSAGE", {
    username,
    message,
  });

  response.status(204);
});

module.exports = router;
