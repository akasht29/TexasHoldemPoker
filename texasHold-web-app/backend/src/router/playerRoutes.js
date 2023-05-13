const express          = require('express');
const router           = express.Router();
const playerController = require("../controllers/playerController");


/*
todo

router.post("/player/join", playerController.joinGame);
router.post("/player/leave", playerController.leaveGame);
*/

// router.post("/create", playerController.createPlayer);

router.post('/create', async (request, response) => {
    try {
        let newPlayerInfo = await playerController.createPlayer(
            request.body.user_id,
            request.body.game_id,
            
        );
    
        if (!newPlayerInfo) {
            throw new Error("Could not make player");
        }

        console.log("Print the game room",newPlayerInfo);
    }
    catch (error) {
        console.log(error.message);
        response.status(500).json({ message: error.message });
    }
});
module.exports = router;