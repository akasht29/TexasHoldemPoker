const express          = require('express');
const router           = express.Router();
const gameController   = require('../controllers/gameController');
const {authMiddleware} = require('../middleware/auth');

router.get('/list', authMiddleware, gameController.getGameList);

router.get('/waiting-room/:gameId', (request, response) => {
    response.render('game-waiting-room', { gameId: request.params.gameId,lobbyOwner: true });
});

router.get('/room/:gameId', (request, response) => {
    response.render('game-room', { gameId: request.params.gameId });
});

router.post('/create', gameController.createGame);

router.post('/join/:gameId', authMiddleware, gameController.joinGame);

router.post('/leave/:gameId/:userId', authMiddleware, gameController.leaveGame);

module.exports = router;
