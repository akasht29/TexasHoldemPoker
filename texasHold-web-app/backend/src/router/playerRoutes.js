const express = require("express");
const router = express.Router();
const playerController = require("../controllers/playerController");
const userModel = require("../models/players/playerModel");
const { PLAYER_JOINED } = require("../../../shared/constants");
/*
todo

router.post("/player/join", playerController.joinGame);
router.post("/player/leave", playerController.leaveGame);
*/

// router.post("/create", playerController.createPlayer);

router.post("/create", async (request, response) => {
  try {
    let newPlayerInfo = await playerController.createPlayer(
      request.body.user_id,
      request.body.game_id
    );

    if (!newPlayerInfo) {
      throw new Error("Could not make player");
    }

    const io = request.app.get("io");
    let username = await userModel.getUserById(request.body.user_id);

    io.to(request.body.game_id).emit(PLAYER_JOINED, {
      username,
    });

    console.log("Socket message sent", username);
    //console.log("Print the game room",newPlayerInfo);
  } catch (error) {
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

    console.log("Print the game room", newPlayerInfo);
  } catch (error) {
    console.log(error.message);
    response.status(500).json({ message: error.message });
  }
});
module.exports = router;
