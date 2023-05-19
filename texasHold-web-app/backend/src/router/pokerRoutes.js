const express = require('express');
const router  = express.Router();

// returns the players current hand as a json object to the client
router.get('/:gameId/getHandCards', async (_request, _response) => {
    // console.log(request.session);
});

router.get('/:gameId/getCommunityCards', async (_request, _response) => {
    //
});

universalActionsWrapper = async (request, response, localActions) => {
    if (!(await pokerController.isPlayersTurn(request.session.player.id))) {
        response.status(400).json({ message: "Please wait for your turn." });
    }

    if (await pokerController.isBigBlind(request.session.player.id)) {
        // add more than min_bet to pot
        // consider making this min_bet * 2 for simplicity.
    }

    if (await pokerController.isSmallBlind(request.session.player.id)) {
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
    await universalActionsWrapper(request, response, () => {
        // pass logic here
    });
});

router.get('/:gameId/allIn', async (request, response) => {
    await universalActionsWrapper(request, response, () => {
        // all in logic here
    });
});

router.get('/:gameId/call', async (request, response) => {
    await universalActionsWrapper(request, response, () => {
        // fold logic here
    });
});

router.get('/:gameId/fold', async (request, response) => {
    await universalActionsWrapper(request, response, () => {
        // fold logic here
    });
});

router.post('/:gameId/raise', async (request, response) => {
    await universalActionsWrapper(request, response, () => {
        // raise logic here
    });
});

module.exports = router;