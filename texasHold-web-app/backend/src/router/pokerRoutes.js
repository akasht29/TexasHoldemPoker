const express = require('express');
const router  = express.Router();
const pokerController = require("../controllers/pokerController");


// returns the players current hand as a json object to the client
router.get('/:gameId/getHandCards', async (_request, _response) => {
    // console.log(request.session);
});

router.get('/:gameId/getCommunityCards', async (_request, _response) => {
    //
});

universalActionsWrapper = async (request, response, localActions) => {
    console.log(request.params);
    if (!(await pokerController.isPlayersTurn(request.params.gameId, request.session.player.playerId))) {
        response.status(400).json({ message: "Please wait for your turn." });
    }
    console.log("hi:", request.session)
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
}

router.get('/:gameId/pass', async (request, response) => {
    try {
        await universalActionsWrapper(request, response, () => {
            // pass logic here
        });
    }
    catch (error) {
        console.log(error.message);
        response.status(500).json({ message: error.message });
    }
});

router.get('/:gameId/allIn', async (request, response) => {
    try {
        await universalActionsWrapper(request, response, () => {
            // all in logic here
        });
    }
    catch (error) {
        console.log(error.message);
        response.status(500).json({ message: error.message });
    }
});

router.get('/:gameId/call', async (request, response) => {
    try {
        await universalActionsWrapper(request, response, () => {
            // call logic here
        });
    }
    catch (error) {
        console.log(error.message);
        response.status(500).json({ message: error.message });
    }
});

router.get('/:gameId/fold', async (request, response) => {
    try {
        await universalActionsWrapper(request, response, () => {
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
        await universalActionsWrapper(request, response, () => {
            // raise logic here
        });
    }
    catch (error) {
        console.log(error.message);
        response.status(500).json({ message: error.message });
    }
});

module.exports = router;