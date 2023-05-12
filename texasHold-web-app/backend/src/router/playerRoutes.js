const express          = require('express');
const router           = express.Router();
const playerController = require("../controllers/playerController");


/*
todo

router.post("/player/join", playerController.joinGame);
router.post("/player/leave", playerController.leaveGame);
*/

router.post("/create", playerController.createPlayer);

module.exports = router;