const express = require("express");
const router = express.Router();
const events = require("../../../shared/constants.js");
const gameModel   = require("../models/game/gameModel");
const db          = require("../database/connection");

router.post("/:id", async (request, response) => {
  const io = request.app.get("io");
  const { message } = request.body;
  const userId = request.session.user.user_id;
  const username = request.session.user.username;

  const value = parseInt(userId, 10);
  const query = `SELECT game_id FROM players WHERE user_id = ${userId}`; 

  const result = await db.one(query, [value]);
  
  const roomId = parseInt(result.game_id);

  //console.log("getting game by user id: " + userId);
  //const gameId = await gameModel.getGameIdByUserId(userId);

  //console.log("got game id: " + gameId.game_id);

  io.in(roomId).emit('CHAT_MESSAGE', {
    username, message
  });

  response.status(204);
});

module.exports = router;