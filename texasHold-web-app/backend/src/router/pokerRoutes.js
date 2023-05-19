const express = require('express');
const router  = express.Router();

// returns the players current hand as a json object to the client
router.get('/:gameId/hand', async (request, _response) => {
    console.log(request.session);
});

router.get('/:gameId/pass', async (_request, _response) => {
    // if the requester's player id is not the current player id.
    //     reutrn some error message (no crashes)

    // wait for other players

    // if a player won render a "you won" screen
    // if a player lost render a "you lost" screen
});

router.get('/:gameId/allIn', async (_request, _response) => {
    // if the requester's player id is not the current player id.
    //     reutrn some error message (no crashes)

    // wait for other players?

    // if a player won render a "you won" screen
    // if a player lost render a "you lost" screen
});

router.get('/:gameId/fold', async (_request, _response) => {
    // if the requester's player id is not the current player id.
    //     reutrn some error message (no crashes)

    // wait for other players?

    // if a player won render a "you won" screen
    // if a player lost render a "you lost" screen
});

router.post('/:gameId/raise', async (_request, _response) => {
    // wait for other players

    // if a player won render a "you won" screen
    // if a player lost render a "you lost" screen
});

module.exports = router;