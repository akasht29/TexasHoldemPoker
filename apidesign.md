|Action | Inputs/data | Pre-conditions | Post Conditions | API endpoint|
|-------|-------------|----------------|-----------------|-------------|
|Realtime Chat between players|1. Username 2. Game id | Has to join a game and waiting room needs to exist|Chat goes into textbox using sockets|POST| chat/:id|
|Puts the players into waiting room to let other players join|1. username 2. gameId | Number of players do not exceed the limit| Puts players in waiting room | GET game/waiting-room/:gameId(gameId, playerid, username are all provided via sessions)|
|Redirects to the game room | 1. Game id | Number of players do not exceed the limit |Prepares the game room | GET game/room/:gameId/start (gameId, playerid, username are all provided via sessions)|
|Loads the players into the game room |1. Game id | Number of players do not exceed the limit | Loads in all the players into the game room | GET game/room/:gameId (gameId, playerid, username are all provided via sessions)|
|Allows players to leave the game | 1.Game id 2.Player id | |Player exits the game and they are removed from game and player id is removed from the database | GET game/room/:gameId/leave|





