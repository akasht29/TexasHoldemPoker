const pokerLogic = require("./pokerLogic");
const gameModel = require("./gameModel");

class PokerGame {
  
    constructor(numPlayers) {
        this.players = this.createPlayers(numPlayers);
        this.deck = pokerLogic.createDeck();
        this.communityCards = [];
        this.pot = 0;
        this.currentPlayer = this.players[0];
        this.smallBlind = 1;
        this.bigBlind = 2;
    }
  
    createPlayers(numPlayers) {

        const players =[];

        for ( let i =0; i < numPlayers; i ++){
            players.push({
                id: null, // Initialize with null
                user_id: null, // Add user_id property
                name: `Empty Seat ${i + 1}`, // Change default name
                chips: 0, // Initialize with 0 chips
                currentBet: 0,
                status: "inactive", // Initialize with "inactive" status
                hand: [],

            })
        }
        return players;
    }

    joinGame(user_id, player_name, buy_in) {
        const emptySeat = this.players.find((player) => player.user_id === null);
    
        if (emptySeat) {
            // Create a new player object and set the corresponding fields
            const newPlayer = {
                id: emptySeat.id,
                name: player_name,
                user_id: user_id,
                chips: buy_in,
                currentBet: 0,
                status: "active",
                hand: [],
            };
    
            // Replace the empty seat with the new player object
            const index = this.players.indexOf(emptySeat);
            this.players[index] = newPlayer;
    
            // Store the updated game state in the database
            const gameId = this.gameId;
            const jsonData = this.toJson();
            gameModel.updateGame(gameId, jsonData);
    
            // Update player_data table
            gameModel.updatePlayerData(user_id, gameId, newPlayer);
        } else {
            throw new Error("No empty seats available");
        }
    }

    /*
    Removes a player with the specified playerId from the game.
    */
    removePlayer(playerId) {
        const index = this.players.findIndex((player) => player.id === playerId);
        if (index !== -1) {
            this.players.splice(index, 1);
        }
    }

    /*
    Handles one complete round of poker. It shuffles and deals the cards, 
    handles blind bets, betting rounds, deals community cards, 
    evaluates hands, determines the winner, distributes the pot, 
    removes broke players, rotates the dealer, and resets the game state 
    for the next round.
    */
    playRound() {
        this.deck = pokerLogic.shuffleDeck(this.deck);
        pokerLogic.dealCards(this.players, this.deck);
        this.communityCards = [];

        this.handleBlindBets();
        // Betting round (pre-flop)
        this.handleBettingRound();

        // Deal community cards and handle betting rounds (flop, turn, river)
        const stages = ["flop", "turn", "river"];
        for (const stage of stages) {
            pokerLogic.dealCommunityCards(stage, this.deck, this.communityCards);
            this.handleBettingRound();
        }

        // Evaluate hands and determine the winner
        pokerLogic.evaluateHands(this.players, this.communityCards);
        const winners = pokerLogic.determineWinner(this.players);

        // Distribute the pot to the winners
        this.distributePot(winners);

        this.removeBrokePlayers();

        this.rotateDealer();
        // Reset the game state for the next round
        this.resetGameState();
    }

    /*
    Deducts small blind and big blind bets from the respective players' chips 
    and updates their current bets.
    */
    handleBlindBets() {
        const smallBlindPlayer = this.getNextActivePlayer(this.currentPlayer);
        const bigBlindPlayer = this.getNextActivePlayer(smallBlindPlayer);

        smallBlindPlayer.currentBet = this.smallBlind;
        smallBlindPlayer.chips -= this.smallBlind;

        bigBlindPlayer.currentBet = this.bigBlind;
        bigBlindPlayer.chips -= this.bigBlind;

        this.currentPlayer = this.getNextActivePlayer(bigBlindPlayer);
    }

    /*
    Returns the next active player in the game, 
    starting from the given currentPlayer.
    */
    getNextActivePlayer(currentPlayer) {
        const startIndex = this.players.indexOf(currentPlayer);
        let index = startIndex;
        do {
            index = (index + 1) % this.players.length;
        } while (this.players[index].status !== "active" && index !== startIndex);
        return this.players[index];
    }

    /*
   Handles a player's action (fold, call, raise, check, or all-in) 
   based on their playerId,
   action type, and amount (if applicable).
   */
    handlePlayerAction(playerId, action, amount) {
        const player = this.players.find((p) => p.id === playerId);

        if (!player) {
            throw new Error("Player not found");
        }

        switch (action) {
            case "fold":
                player.status = "folded";
                break;
            case "call":
                const highestBet = Math.max(...this.players.map((p) => p.currentBet));
                player.chips -= highestBet - player.currentBet;
                player.currentBet = highestBet;
                break;
            case "raise":
                const totalBet = player.currentBet + amount;
                if (totalBet > player.chips) {
                    throw new Error("Not enough chips to raise");
                }
                player.chips -= amount;
                player.currentBet = totalBet;
                break;

            case "check":
                break;

            case "all-in":
                player.currentBet += player.chips;
                player.chips = 0;
                break;
            default:
                throw new Error("Invalid action");
        }
    }

    /*
    Handles a betting round with the specified minimum bet, updates the pot value, 
    and rotates the currentPlayer to the next active player.
    */
    handleBettingRound(minBet = 1) {
        pokerLogic.handleBettingRound(this.players, this.currentPlayer, minBet);

        this.pot = this.players.reduce((acc, player) => acc + player.currentBet, 0);
    }

    /*
    Removes players with zero chips from the game.
    */
    removeBrokePlayers() {
        this.players = this.players.filter((player) => player.chips > 0);
    }

    /*
    Rotates the dealer by setting the currentPlayer to the next active player.
    */
    rotateDealer() {
        this.currentPlayer = this.getNextActivePlayer(this.currentPlayer);
    }

    /*
    Distributes the pot among the winner(s) by dividing the pot equally 
    and giving any remaining chips due to rounding.
    */
    distributePot(winners) {
        const totalPot = this.pot;
        const potShare = Math.floor(totalPot / winners.length);

        winners.forEach((winner) => {
            winner.chips += potShare;
        });

        //Distribute any remaining chips due to the rounding
        let remainingChips = totalPot - potShare * winners.length;
        for (const winner of winners) {
            if (remainingChips <= 0) break;
            winner.chips += 1;
            remainingChips -= 1;
        }
    }

    /*
    Resets the game state for the next round by resetting the current bets, 
    hands, statuses, deck, community cards, and pot.
    */
    resetGameState() {
        this.players.forEach((player) => {
            player.currentBet = 0;
            player.hand = [];
            player.status = "active";
        });

        this.deck = pokerLogic.createDeck();
        this.communityCards = [];
        this.pot = 0;
    }

    /*
    Returns the current game state as an object with players, 
    communityCards, pot, and currentPlayer properties.
    */
    getState() {
        return {
            players: this.players,
            communityCards: this.communityCards,
            pot: this.pot,
            currentPlayer: this.currentPlayer,
        };
    }

    /*
    the toJson() and fromJson() methods allow for serialization and deserialization 
    of the game state, making it possible to store or load game state data
     as needed.
    */
    /*
    Converts the PokerGame object into a JSON string representation.
    */
    toJson() {
        return JSON.stringify({
            players: this.players,
            deck: this.deck,
            communityCards: this.communityCards,
            pot: this.pot,
            currentPlayer: this.currentPlayer,
        });
    }

    /*
    Creates a new PokerGame object from the given JSON string.
    */
    static fromJson(json) {
        const data = JSON.parse(json);
        const pokerGame = new PokerGame(data.players.length);
        pokerGame.players = data.players;
        pokerGame.deck = data.deck;
        pokerGame.communityCards = data.communityCards;
        pokerGame.pot = data.pot;
        pokerGame.currentPlayer = data.currentPlayer;
        pokerGame.smallBlind = data.smallBlind;
        pokerGame.bigBlind = data.bigBlind;
        return pokerGame;
    }
}

module.exports = PokerGame;
