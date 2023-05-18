const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");
const playerController = require("../controllers/playerController");
const playerModel = require("../models/players/playerModel");
const db = require("../database/connection");

router.get("/waiting-room/:gameId", async (request, response) => {
  try {
    const gameId = request.params.gameId;
    const userId = request.session.user.user_id;
    var connectedGameId = null;

    // check if there is room in the game
    if (await gameController.gameFull(gameId)) {
      response.redirect("/user/lobby");
    }

    try {
      const value = parseInt(userId, 10);
      const query = `SELECT game_id FROM players WHERE user_id = ${userId}`;
      const result = await db.one(query, [value]);
      var connectedGameId = parseInt(result.game_id);

      console.log("Player in game_id: ", connectedGameId);
    } catch (error) {
      console.log("Player not connected to a game");
    }

    let playerId;
    let tempPlayerId;
    if (connectedGameId) {
      if (parseInt(gameId) == connectedGameId) {
        console.log(
          "Playerid " + tempPlayerId + " already present in this game"
        );

        try {
          const value = parseInt(userId, 10);
          const query = `SELECT player_id FROM players WHERE user_id = ${userId}`;
          const result = await db.one(query, [value]);
          tempPlayerId = parseInt(result.player_id);

          //placing the fetched playerid into the session object
          player = {
            playerId: tempPlayerId,
          };
          request.session.player = player;
          playerId = tempPlayerId;
        } catch (error) {
          console.log("Error getting player_id from player: ", error.message);
        }
      } else {
        //if the user is already connected to a different game, return them to the lobby
        response.redirect("/user/lobby");
        console.log(
          "Playerid " + tempPlayerId + " already present in another game"
        );
        return;
      }
    } else {
      // generate a new player id for the user if needed
      player = {
        playerId: await playerController.addPlayer(gameId, userId),
      };
      request.session.player = player;
      playerId = player.playerId;
    }

    console.log("playerData:", request.session.player, playerId);
    // check if the game has started.
    if (await gameController.gameStarted(gameId)) {
      response.redirect(`/game/room/${gameId}`);
    }

    response.render("game-waiting-room", {
      gameId: gameId,
      lobbyOwner: await gameController.firstPlayer(gameId, playerId),
    });
  } catch (error) {
    console.log("Generic game waiting-room error:", error.message);
  }
});

router.get("/room/:gameId/start", (request, response) => {
  const io = request.app.get("io");
  try {
    // Redirect all players to `/game/room/${gameId}`
    const gameId = request.params.gameId;
    const roomId = parseInt(gameId);
    const redirectURL = `/game/room/${gameId}`;

    io.in(roomId).emit("GAME_STARTING", redirectURL);
    response.redirect(redirectURL);
  } catch (error) {
    console.log("game room start error:");
  }
});

router.get("/room/:gameId", async (request, response) => {
  try {
    const gameId = request.params.gameId;

    if (await gameController.gameFull(gameId)) {
      response.redirect("user/lobby");
    }

    response.render("game-room", { gameId: gameId });
  } catch (error) {
    console.log("game room error:", error.message);
    response.redirect("user/lobby");
  }
});

router.get("/room/:gameId/leave", async (request, response) => {
  //console.log("playerId:", JSON.stringify(request.session.player.playerId));
  const io = request.app.get("io");
  const roomId = parseInt(request.params.gameId);
  if (request.session.player == null) {
    io.in(roomId).emit("SESSION_ERROR");
  } else {
    let username = request.session.user.username;
    io.in(roomId).emit("PLAYER_LEFT", {
      username,
    });

    io.socketsLeave(roomId);

    await playerController.removePlayer(
      request.params.gameId,
      request.session.player.playerId
    );

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
  } catch (error) {
    console.log(error.message);
    response.status(500).json({ message: error.message });
  }
});




module.exports = router;
