const express          = require('express');
const router           = express.Router();
const pokerController  = require("../controllers/pokerController");
const playerController = require("../controllers/playerController");
const gameModel        = require("../models/gameModel");
const playerModel      = require('../models/playerModel');
const gameController   = require('../controllers/gameController');

// returns the players current hand as a json object to the client
router.get('/:gameId/getHandCards', async (_request, _response) => {
    // console.log(request.session);
});

router.get('/:gameId/getCommunityCards', async (_request, _response) => {
    //
});

universalActionsWrapper = async (request, response, io, localActions) => {
    console.log('entering wrapper');
    const username = request.session.user.username;
    const gameId   = request.params.gameId;
    const playerId = request.session.player.playerId;
    
    if (await playerController.isPlayerFolded(playerId)) {
        console.log('exiting wrapper 1');
        return false;
    }

    if (!(await playerController.isPlayersTurn(playerId))) {
        console.log('exiting wrapper 2');
        return false;
    }
    
    const minBet = await gameModel.getMinBet(gameId);
    
    if (
        (await  playerController.isBigBlind(playerId)) &&
        ((await pokerController.getPotSize(playerId)) == 0)
    ) {
        pokerController.bet(
            gameId,
            playerId,
            minBet
        );
    }
    
    if (
        (await playerController.isSmallBlind(playerId)) &&
        ((await pokerController.getPotSize(playerId)) <= minBet)
    ) {
        pokerController.bet(
            gameId,
            playerId,
            minBet / 2
        );
    }

    let ret = await localActions();

    if (!ret) {
        return ret;
    }

    const gameInfo = await gameModel.getGameData(gameId);
    let players = JSON.parse(JSON.stringify(gameInfo.players)); 
    
    if (await pokerController.roundOver(gameId)) {
        console.log('round is over!');
        await gameController.incrementRound(gameId);
        
        if (await gameController.isGameOver(gameId)) {

            // TODO: Rediret all players in the current game to the standings page.
            response.redirect(`poker/${gameId}/standings`);
        }
        else {
            console.log('clearing cards!');
            await pokerController.clearCards(gameId);
            await pokerController.dealCardsToPlayers(gameId);
            await pokerController.unfoldPlayers(gameId);
            let newDealer = await gameController.incrementDealer(gameId);
            await gameModel.setTurn(gameId, newDealer);

            console.log("community cards:", await gameModel.getCommunityCards(
                request.params.gameId
            ));
            io.in(parseInt(request.params.gameId)).emit("NEW_COMMUNITY_CARDS", {
                // info passed to clients goes here
                communityCards: await gameModel.getCommunityCards(
                    request.params.gameId
                )
            });
        }
    }
    else {
        console.log("going to next player");
        await pokerController.nextTurn(gameId);

        if (await pokerController.isNewCycle(gameId)) {
            let communityCards = await gameModel.getCommunityCards(
                request.params.gameId
            );
            
            if (communityCards.length < 4) {
                console.log("dealing a card to community!");
                await pokerController.dealCardToCommunity(gameId);

                communityCards = await gameModel.getCommunityCards(
                    request.params.gameId
                );
        
                io.in(parseInt(request.params.gameId)).emit("NEW_COMMUNITY_CARDS", {
                    // info passed to clients goes here
                    communityCards: communityCards
                });
            }
        }
    }

    console.log('exiting wrapper 3');
    return ret;
}

router.head('/:gameId/pass', async (request, response) => {
    try {
        const io = request.app.get("io");
        const username = request.session.user.username;

        let success = await universalActionsWrapper(request, response, io, async () => {
            // check if pass is valid
            let canPass = true;
            if (!canPass) {
                return false;
            }

            await pokerController.nextTurn(gameId);

            io.in(parseInt(request.params.gameId)).emit("PASS", {
                // info passed to clients goes here
                username: username
            });

            return true;
        });

        if (success) {
            response.status(200);
        }
    
        response.status(400)
    }
    catch (error) {
        console.log(error.message);
        response.status(500).json({ message: error.message });
    };
});

router.head('/:gameId/allIn', async (request, response) => {
    try {
        const io       = request.app.get("io");
        const username = request.session.user.username;

        let success = await universalActionsWrapper(request, response, io, async () => {
            // all in logic here
            let playerInfo = await playerModel.getPlayerData(request.session.player.playerId);

            await pokerController.bet(
                request.params.gameId,
                request.session.player.playerId,
                playerInfo.chips
            );

            await playerModel.setToAllIn(request.session.player.playerId);

            io.in(parseInt(request.params.gameId)).emit("ALLIN", {
                // info passed to clients goes here
                username: username
            });

            return true;
        });
        
        if (success) {
            response.status(200);
        }
        else {
            response.status(400);
        }
    }
    catch (error) {
        console.log(error.message);
        response.status(500).json({ message: error.message });
    }

    response.status(200);
});

router.head('/:gameId/call', async (request, response) => {
    try {
        const io = request.app.get("io");
        const username = request.session.user.username;

        let success = await universalActionsWrapper(request, response, io, async () => {
            let highestBet = await pokerController.getHighestBet(request.params.gameId);
            let playerInfo = await playerModel.getPlayerData(request.session.player.playerId);
            let amount     = highestBet - playerInfo.curr_bet;
            
            console.log('marker')

            await pokerController.bet(
                request.params.gameId,
                request.session.player.playerId,
                amount
            );

            console.log('marker')

            playerInfo = await playerModel.getPlayerData(request.session.player.playerId);

            if (playerInfo.chips == 0) {
                await playerModel.setToAllIn(request.session.player.playerId);
            }

            io.in(parseInt(request.params.gameId)).emit("CALL", {
                username: username,
                chips: playerInfo.chips,
                curr_bet: playerInfo.curr_bet
            });

            return true;
        });

        if (success) {
            response.status(200);
        }
    
        response.status(400);
    }
    catch (error) { 
        console.log(error.message);
        response.status(500).json({ message: error.message });
    }

    response.status(200);
});

router.head('/:gameId/fold', async (request, response) => {
    try {
        const io       = request.app.get("io");
        const username = request.session.user.username;
        let playerInfo = await playerModel.getPlayerData(request.session.player.playerId);

        let success = await universalActionsWrapper(request, response, io, async () => {
            console.log("player id:", request.session.player.playerId);
            await playerModel.setToFolded(request.session.player.playerId);

            io.in(parseInt(request.params.gameId)).emit("FOLD", {
                username: username,
                chips: playerInfo.chips,
                curr_bet: playerInfo.curr_bet
            });

            return true;
        });

        if (success) {
            response.status(200);
        }
    
        response.status(400);
    }
    catch (error) {
        console.log(error.message);
        response.status(500).json({ message: error.message });
    }
});

router.post('/:gameId/raise', async (request, response) => {
    try {
        const io = request.app.get("io");
        const username = request.session.user.username;

        let success = await universalActionsWrapper(request, response, io, async () => {
            // raise logic here
            let amount = request.body.amount;

            await pokerController.bet(
                request.params.gameId,
                request.session.player.playerId,
                amount
            );

            io.in(parseInt(request.params.gameId)).emit("RAISE", {
                username: username,
                chips: playerInfo.chips,
                curr_bet: playerInfo.curr_bet
            });

            return true;
        });

        if (success) {
            response.status(200);
        }
    
        response.status(400);
    }
    catch (error) {
        console.log(error.message);
        response.status(500).json({ message: error.message });
    }
});

module.exports = router;