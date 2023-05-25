const express          = require("express");
const router           = express.Router();
const playerController = require("../controllers/playerController");
const playerModel      = require("../models/playerModel");
/*
todo

router.post("/player/join", playerController.joinGame);
router.post("/player/leave", playerController.leaveGame);
*/

// router.post("/create", playerController.createPlayer);

router.post("/create", async (request, response) => {
  const io = request.app.get("io");
  try {
    let newPlayerInfo = await playerController.createPlayer(
      request.body.user_id,
      request.body.game_id
    );

    let players = await playerModel.getAllPlayers;

    io.in(parseInt(request.params.gameId)).emit("PLAYER_JOINED", {
      // info passed to clients goes here
      username,
      players,
    });

    if (!newPlayerInfo) {
      throw new Error("Could not make player");
    }

  } 
  catch (error) {
    console.log(error.message);
    response.status(500).json({ message: error.message });
  }
});

router.post("/add", async (request, response) => {
  try {
    let newPlayerInfo = await playerController.addPLayer(request.body.game_id);

    if (!newPlayerInfo) {
      throw new Error("Could not make add players");
    }
  } 
  catch (error) {
    console.log(error.message);
    response.status(500).json({ message: error.message });
  }
});

module.exports = router;
