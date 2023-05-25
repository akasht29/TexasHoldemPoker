const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");
const playerController = require("../controllers/playerController");
const userModel = require("../models/userModel");
const db = require("../database/connection");
const playerModel = require("../models/playerModel");

router.get("/waiting-room/:gameId", async (request, response) => {
  try {
    const gameId = request.params.gameId;
    const userId = request.session.user.user_id;
    var playerId = null;
    var connectedGameId = null;

    if (await gameController.gameFull(gameId)) {
      // check if there is room in the game
      response.redirect("/user/lobby");
      return;
    }

    try {
      console.log("userId:", userId);
      playerId = await playerModel.getPlayerbyUserIdInGame(userId, gameId);
      console.log("userId:", playerId);
      player = {
        playerId: playerId,
        game_id: parseInt(gameId),
      };
      request.session.player = player;
    } 
    catch (error) {
      console.log("The player is not connected to this game");
    }

    if (!playerId) {
      // generate a new player id for the user if needed
      player = {
        playerId: await playerController.addPlayer(gameId, userId),
        game_id: parseInt(gameId),
      };
      request.session.player = player;
      playerId = player.playerId;
    }

    // check if the game has started.
    if (await gameController.gameStarted(gameId)) {
      response.redirect(`/game/room/${gameId}`);
    }

    response.render("game-waiting-room", {
      gameId: gameId,
      lobbyOwner: await gameController.firstPlayer(gameId, playerId),
    });
  } 
  catch (error) {
    console.log("Generic game waiting-room error:", error.message);
  }
});

router.get("/room/:gameId/start", async (request, response) => {
  const io = request.app.get("io");
  
  try {
    // Redirect all players to `/game/room/${gameId}`
    const gameId = request.params.gameId;
    const roomId = parseInt(gameId);
    const redirectURL = `${process.env.API_BASE_URL}/game/room/${gameId}`;

    io.in(roomId).emit("GAME_STARTING", { redirectURL });

    await pokerController.dealCardsToPlayers(gameId, request.app.get("io"));

    response.redirect(redirectURL);
  } 
  catch (error) {
    console.log("game room start error:");
  }
});

router.get("/room/:gameId", async (request, response) => {
  const io = request.app.get("io");
  try {
    const gameId = request.params.gameId;

    if (await gameController.gameFull(gameId)) {
      response.redirect("user/lobby");
    }
    // update in game player list
    let username = request.session.user.username;

    var players = await playerModel.getAllPlayers(gameId);
    for (let i = 0; i < players.length; i++) {
      players[i].player_id = await userModel.getUserNameById(
        players[i].user_id
      );
    }
    io.in(parseInt(gameId)).emit("PLAYER_JOINED", { username }, players);

    response.render("game-room", {
      gameId: gameId,
      baseUrl: process.env.API_BASE_URL,
    });
  } 
  catch (error) {
    response.redirect("user/lobby");
  }
});

router.get("/room/:gameId/leave", async (request, response) => {
  //console.log("playerId:", JSON.stringify(request.session.player.playerId));
  const io = request.app.get("io");
  const roomId = parseInt(request.params.gameId);
  
  if (request.session.player == null) {
    io.in(roomId).emit("SESSION_ERROR");
  } 
  else {
    let username = request.session.user.username;

    try {
      await playerController.removePlayer(
        request.params.gameId,
        request.session.player.playerId
      );
    } catch (error) {
      console.log("game room error:", error.message);
    }
    
    // update in game player list
    var players = await playerModel.getAllPlayers(request.params.gameId);
    for (let i = 0; i < players.length; i++) {
      players[i].player_id = await userModel.getUserNameById(
        players[i].user_id
      );
    }
    io.in(parseInt(request.params.gameId)).emit(
      "PLAYER_LEFT",
      { username },
      players
    );

    //io.socketsLeave(roomId);

    await gameController.deleteGameIfEmpty(request.params.gameId);
    request.session.player = null;
  }
  response.redirect("/user/lobby");
});

router.post("/create", async (request, response) => {
  try {
    let newGameInfo = await gameController.createGame(
      request.body.gameName,
      request.body.maxPlayers,
      request.body.maxRounds,
      request.body.minBet
    );

    if (!newGameInfo) {
      throw new Error("Could not make game");
    }

    response.redirect(`/game/waiting-room/${newGameInfo.game_id}`);
  } 
  catch (error) {
    response.status(500).json({ message: error.message });
  }
});

module.exports = router;
