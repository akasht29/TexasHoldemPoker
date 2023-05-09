const pokerLogic = {};
//pokerLogic.suits: An array containing the four suits in a deck of cards - hearts, diamonds, clubs, and spades.
pokerLogic.suits = ["hearts", "diamonds", "clubs", "spades"];
//pokerLogic.ranks: An array containing the thirteen ranks in a deck of cards - 2 to 10, Jack (J), Queen (Q), King (K), and Ace (A).
pokerLogic.ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
/*
pokerLogic.createDeck: This function creates a standard 52-card deck. 
It iterates through all the suits and ranks, creating an object for each card with its suit and rank, 
and adding it to the deck array.
*/
pokerLogic.createDeck = () => {
    const deck = [];

    for (const suit of pokerLogic.suits) {
        for (const rank of pokerLogic.ranks) {
            deck.push({ suit, rank });
        }
    }

    return deck;
};
/*
pokerLogic.shuffleDeck: This function shuffles the given deck using the Fisher-Yates shuffle algorithm. 
It iterates through the deck from the last card to the first, and for each card, 
it generates a random index and swaps the card at that index with the current card.
*/
pokerLogic.shuffleDeck = (deck) => {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
};
/*
pokerLogic.dealCards: This function deals two cards to each player from the given deck.
 It iterates through the players and assigns them two cards from the top of the deck.
*/
pokerLogic.dealCards = (players, deck) => {
    players.forEach((player) => {
        player.hand = [deck.pop(), deck.pop()];
    });
};
/*
pokerLogic.dealCommunityCards: This function deals community cards based 
on the stage of the game (flop, turn, or river)and updates the given 
communityCards array. It takes three cards from the top of the deck for
 the flop and one card for the turn and river.
*/
pokerLogic.dealCommunityCards = (stage, deck, communityCards) => {
    if (stage === "flop") {
        communityCards.push(deck.pop(), deck.pop(), deck.pop());
    } else if (stage === "turn" || stage === "river") {
        communityCards.push(deck.pop());
    }
};
/*
pokerLogic.evaluateHands: This function evaluates the hands of each player
 and updates their flush and straight properties. 
 It combines each player's hand with the community cards
  and checks if the player has a flush or a straight.
*/
pokerLogic.evaluateHands = (players, communityCards) => {
    players.forEach((player) => {
        const allCards = player.hand.concat(communityCards);
        player.flush = pokerLogic.isFlush(allCards);
        player.straight = pokerLogic.isStraight(allCards);
    });
};
/*
pokerLogic.determineWinner: This function determines the winner(s)
 among the given players based on their hand ranks. 
 It checks if a player has a straight flush, flush, or straight
  and assigns hand ranks accordingly. 
  It then compares the hand ranks of all players to find the winner(s).
*/
pokerLogic.determineWinner = (players) => {
    let winners = [];
    let bestHandRank = -1;

    players.forEach((player) => {
        let handRank;

        if (player.flush && player.straight) {
            handRank = 8; // Straight flush
        } else if (player.flush) {
            handRank = 5; // Flush
        } else if (player.straight) {
            handRank = 4; // Straight
        } else {
            handRank = 0; // High card (placeholder for simplicity)
        }

        if (handRank > bestHandRank) {
            winners = [player];
            bestHandRank = handRank;
        } else if (handRank === bestHandRank) {
            winners.push(player);
        }
    });

    return winners;
};
/*
pokerLogic.handleBettingRound: This function handles a betting round for 
the given players. It iterates through the players and, if a player is active, 
deducts the minimum bet from their chips and adds it to their current bet. 
It also updates the currentPlayer to the next active player.
*/
pokerLogic.handleBettingRound = (players, currentPlayer, minBet) => {
    
    players.forEach((player) => {
        if (player.status === "active") {
            const bet = Math.min(player.chips, minBet);
            player.chips -= bet;
            player.currentBet += bet;
        }
    });

    currentPlayer = players.find((player) => player.status === "active");
};

/*
pokerLogic.isFlush: This function checks if a flush exists in the given set
 of cards. It counts the occurrences of each suit and returns true 
 if there are at least five cards of the same suit.
*/
pokerLogic.isFlush = (cards) => {
    const suits = {};
    cards.forEach((card) => {
        suits[card.suit] = (suits[card.suit] || 0) + 1;
    });
    return Object.values(suits).some((count) => count >= 5);
};

/*
pokerLogic.isStraight: This function checks if a straight exists in the given 
set of cards. It first assigns numeric values to the cards' ranks, 
then checks for a sequence of five consecutive unique ranks.
 If such a sequence is found, it returns true.
*/
pokerLogic.isStraight = (cards) => {
    const ranks = pokerLogic.ranks;
    const rankValues = cards.map((card) => {
        const rankValue = ranks.indexOf(card.rank) + 2;
        return rankValue === 14 ? [1, 14] : [rankValue];
    });
    const uniqueRanks = new Set(rankValues.flat());
    const sortedRanks = Array.from(uniqueRanks).sort((a, b) => a - b);

    for (let i = 0; i < sortedRanks.length - 4; i++) {
        if (
            sortedRanks[i] + 1 === sortedRanks[i + 1] &&
            sortedRanks[i] + 2 === sortedRanks[i + 2] &&
            sortedRanks[i] + 3 === sortedRanks[i + 3] &&
            sortedRanks[i] + 4 === sortedRanks[i + 4]
        ) {
            return true;
        }
    }

    return false;
};

module.exports = pokerLogic;
