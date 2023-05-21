const pgarray = require("pg-array");
const gameModel   = require("../models/gameModel");
const playerModel = require("../models/playerModel");
const playerController = require("./playerController");

pokerController = {};

pokerController.getPotSize = async (gameId) => {
    const players = await playerModel.getAllPlayers(gameId);
    let potSize   = 0;

    for (let i = 0; i < players.length; i++) {
        potSize += players.curr_bet;
    }

    return potSize;
}

pokerController.clearCards = async (gameId) => {
    let players = await playerModel.getAllPlayers(gameId);
    
    for (let i = 0; i < players.length; i++) {
        await playerModel.setHand(players[i].player_id, []);
    }

    await gameModel.setCommunityCards(gameId, []);
}

pokerController.dealCardsToPlayers = async (gameId) => {
    let players = await playerModel.getAllPlayers(gameId);

    for (let i = 0; i < players.length; i++) {
        let newHand = [
            await gameModel.popCardOffDeck(gameId),
            await gameModel.popCardOffDeck(gameId)
        ];
        const newHandStr = JSON.stringify(newHand);
        await playerModel.setHand(
            players[i].player_id, 
            pgarray(newHandStr.substring(1, newHandStr.length - 1))
        );
    }
}

pokerController.dealCardToCommunity = async (gameId) => {
    let gameInfo = gameModel.getGameData(gameId);
    
    for (let i = 0; i < gameInfo.players.length; i++) {
        await gameModel.setCommunityCards(
            gameId,
            gameInfo.communityCards.push(
                await gameModel.popCardOffDeck(gameId)
            )
        );
    }
}

pokerController.getIndexOfPlayerId = async (gameId, playerId) => {
    const gameInfo = await gameModel.getGameData(gameId);
    
    for (let i = 0; i < gameInfo.players.length; i++) {
        if (gameInfo.players[i].player_id == playerId) {
            return i;
        }
    }

    return -1;
}

pokerController.getHighestBet = async (gameId) => {
    const players = await playerModel.getAllPlayers(gameId);
    
    let highestBid = 0;
    for (let i = 0; i < players.length; i++) {
        if (players[i].curr_bet > highestBid) {
            highestBid = players[i].curr_bet;
        }
    }

    return highestBid;
}

pokerController.bet = async (gameId, playerId, amount) => {
    let playerInfo = await playerModel.getPlayerData(playerId);

    if (playerInfo.game_id != gameId) {
        throw new Error("Player not in game.");
    }

    if (playerInfo.chips < playerInfo.curr_bet + amount) {
        amount = playerInfo.chips - playerInfo.curr_bet;
    }

    playerInfo.chips    -= amount;
    playerInfo.curr_bet += amount;

    await playerModel.playerModel.setChipsAndBet(playerId, playerInfo.chips, playerInfo.bet);
}

pokerController.nextTurn = async (gameId) => {
    let playerId = await pokerController.getCurrentPlayer(gameId);
    
    while (
        !(await pokerController.isNewRound(gameId)) && (
            (await playerController.isPlayerFolded(playerId)) ||
            (await playerController.isPlayerCalled(playerId)) ||
            (await playerController.isPlayerAllIn(playerId))
        )
    ) {
        await gameController.incrementTurn(gameId);
        playerId = await pokerController.getCurrentPlayer(gameId);
    }
}

pokerController.unfoldPlayers = async (gameId) => {
    let players = await playerModel.getAllPlayers(gameId);

    for (let i = 0; i < players.length; i++) {
        await playerModel.setToCalled(players[i].player_id);
    }
}

pokerController.roundOver = async (gameId) => {
    const players = await playerModel.getAllPlayers(gameId);
    let remaining = players.length;
    
    for (let i = 0; i < players.length; i++) {
        if (
            (await playerController.isPlayerFolded(players[i].player_id)) ||
            (await playerController.isPlayerCalled(players[i].player_id))
        ) {
            remaining--;
        }
    }

    return remaining <= 1;
}

pokerController.isNewRound = async (gameId) => {
    let gameInfo = await gameModel.getGameData(gameId);

    return gameInfo.curr_turn == -1;
}

getScore = (bigRank, littleRank) => {
    return Math.pow(2, (bigRank * 13)) + (bigRank * littleRank);
}

rateHand = (handCards, communityCards) => {
    let score             = 0; 
    let rankCounter       = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
    let suitCounter       = [ 0, 0, 0, 0 ];
    let straightPossible  = true;
    let fullHousePossible = 0;
    let allCards          = communityCards.concat(handCards);
    
    for (let i = 0; i < allCards.length; i++) {
        rankCounter[allCards[i] % 13]++;
        suitCounter[Math.trunc(allCards[i] / 13)]++;
    }

    for (let i = 0; i < handCards.length; i++) {
        if (
            (rankCounter[handCards[i] % 13] > 1) ||
            (suitCounter[handCards[i] / 13] > 4)
        ) {
            // don't do anything
        }
        else {
            score += getScore(1, handCards[i] % 13);
        }
    }

    for (let k = rankCounter.length - 1; k >= 0; k--) {
        if (rankCounter[k] == 2) {
            // PAIR DETECTED!!!
            if (fullHousePossible == 3) {
                // FULL HOUSE DETECTED!!!
                score += getScore(7, k);
            }
            fullHousePossible = 2;

            score += getScore(2, k);
        }
        else if (rankCounter[k] == 3) {
            if (fullHousePossible == 2) {
                // FULL HOUSE DETECTED!!!
                score += getScore(7, k);
            }
            fullHousePossible = 3;
            straightPossible  = false

            score += getScore(3, k);
        }
        else if (rankCounter[k] == 4) {
            // FOUR OF A KIND DETECTED!!!
            score += getScore(8, k);

            fullHousePossible = false;
            straightPossible  = false;
        }
    }

    let straightHappened = false;
    if (straightPossible) {
        let contiguous = 0;
        for (let i = rankCounter.length - 2; i >= 0; i--) {
            if (rankCounter[i] > 0 && rankCounter[i + 1] > 0) {
                contiguous++;
            }
            else {
                contiguous = 0;
            }

            if (contiguous > 3) {
                // STRAIGHT DETECTED!!!
                score += getScore(4, i);
                straightHappened = true;
                break;
            }
        }
    }
    
    // check for flushes
    for (let j = 0; j < suitCounter.length; j++) {
        if (suitCounter[j] > 4) {
            // FLUSH DETECTED!!!
            score += getScore(5, 1);

            if (straightHappened) {
                score += getScore(9, 2);
            }
        }
    }

    return score;
}

pokerController.ratePlayerHand = async (gameId, playerId) => {
    let gameInfo = await gameModel.getGameData(gameId);
    console.log("gameInfo:", gameInfo);
}

module.exports = pokerController;