const express = require('express');
const router  = express.Router();
const pokerController = require("../controllers/pokerController");
const gameModel   = require("../models/game/gameModel");

// returns the players current hand as a json object to the client
router.get('/:gameId/getHandCards', async (_request, _response) => {
    // console.log(request.session);
});

router.get('/:gameId/getCommunityCards', async (_request, _response) => {
    //
});

universalActionsWrapper = async (request, response, gameData, action, localActions) => {
    const io = request.app.get("io");
    const username = request.session.user.username;

    console.log(request.params);

    //something here is broken

    /*
    if (!(await pokerController.isPlayersTurn(request.params.gameId, request.session.player.playerId))) {
        response.status(400).json({ message: "Please wait for your turn." });
    }
    
    if (await pokerController.isBigBlind(request.session.player.playerId)) {
        // add more than min_bet to pot
        // consider making this min_bet * 2 for simplicity.
    }

    if (await pokerController.isSmallBlind(request.session.player.playerId)) {
        // add min_bet to pot?
    }

    localActions();
    
    await pokerController.incrementTurn(request.params.gameId);

    if (await pokerController.isGameOver(request.params.gameId)) {
        // display standings
    }
    else if (await pokerController.isNewRound(request.params.gameId)) {
        // deal cards
    }
    */

    io.in(parseInt(request.params.gameId)).emit("GAME_UPDATE", {
        // info passed to clients goes here
        username,
        action,
        gameData,
      });

    response.status(200).json({ message: "success" });
}

router.head('/:gameId/pass', async (request, response) => {
    try {
        const gameData = await gameModel.getGameData(request.params.gameId);
        const action = "PASS";
        await universalActionsWrapper(request, response, gameData, action, () => {
            // pass logic here
        });
    }
    catch (error) {
        console.log(error.message);
        response.status(500).json({ message: error.message });
    }
});

router.head('/:gameId/allIn', async (request, response) => {
    try {
        const gameData = await gameModel.getGameData(request.params.gameId);
        const action = "ALLIN";
        await universalActionsWrapper(request, response, gameData, action, () => {
            // all in logic here
        });
    }
    catch (error) {
        console.log(error.message);
        response.status(500).json({ message: error.message });
    }
});

router.head('/:gameId/call', async (request, response) => {
    try {
        const gameData = await gameModel.getGameData(request.params.gameId);
        const action = "CALL";
        await universalActionsWrapper(request, response, gameData, action, () => {
            // call logic here
        });
    }
    catch (error) { 
        console.log(error.message);
        response.status(500).json({ message: error.message });
    }
});

router.head('/:gameId/fold', async (request, response) => {
    try {
        const gameData = await gameModel.getGameData(request.params.gameId);
        const action = "FOLD";
        await universalActionsWrapper(request, response, gameData, action, () => {
            // fold logic here
        });
    }
    catch (error) {
        console.log(error.message);
        response.status(500).json({ message: error.message });
    }
});

router.post('/:gameId/raise', async (request, response) => {
    try {
        const gameData = await gameModel.getGameData(request.params.gameId);
        const action = "RAISE";
        await universalActionsWrapper(request, response, gameData, action, () => {
            // raise logic here
        });
    }
    catch (error) {
        console.log(error.message);
        response.status(500).json({ message: error.message });
    }
});

module.exports = router;