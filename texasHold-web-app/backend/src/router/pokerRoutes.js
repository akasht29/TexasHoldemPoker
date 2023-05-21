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
        
                io.in(parseInt(request.params.gameId)).emit("NEW_COMMUNITY_CARD", {
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
    console.log('marker')
    try {
        const gameId   = request.params.gameId;
        const playerId = request.session.player.playerId;
        const io       = request.app.get("io");
        const username = request.session.user.username;

        if (!(await pokerController.canPlayerMove(playerId))) {
            response.status(400).send("player cant move");
            return;
        }

        await pokerController.handleBlindBets(gameId, playerId);

        // call logic here
        {
            const playerInfo = await playerModel.getPlayerData(playerId);
            const highestBet = await pokerController.getHighestBet(gameId);
            console.log("highestBet:", highestBet, "currentBet:", playerInfo.curr_bet);
            await pokerController.bet(
                gameId,
                playerId,
                highestBet - playerInfo.curr_bet
            );
        }

        await pokerController.nextTurn(gameId);

        if (await pokerController.isNewCycle(gameId)) {
            console.log('new cycle!');
            const gameInfo   = await gameModel.getGameData(gameId);
            if (gameInfo.communitycards.length < 5) {
                console.log('dealing a card to the community cards!');

                await pokerController.dealCardToCommunity(gameId);

                await io.in(parseInt(request.params.gameId)).emit("NEW_COMMUNITY_CARDS", {
                    // info passed to clients goes here
                    communityCards: (await gameModel.getGameData(gameId)).communitycards
                });
            }
        }
        else if (await pokerController.roundOver(gameId)) {
            await pokerController.clearCards(gameId);
            await pokerController.dealCardsToPlayers(gameId);
            await pokerController.unfoldPlayers(gameId);
            let newDealer = await gameController.incrementDealer(gameId);
            await gameModel.setTurn(gameId, newDealer);
        }

        if (await gameController.isGameOver(gameId)) {
            console.log("game over");
            response.redirect(`poker/${gameId}/standings`);
        }
        
        response.status(200).send("player cant move");
    }
    catch (error) { 
        console.log(error.message);
        response.status(500).send("server error");
    }
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