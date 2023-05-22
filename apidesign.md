|Action | Inputs/data | Pre-conditions | Post Conditions | API endpoint|
|-------|-------------|----------------|-----------------|-------------|
|Realtime Chat between players|1. Username 2. Game id | Has to join a game and waiting room needs to exist|Chat goes into textbox using sockets|POST| chat/:id|
|Puts the players into waiting room to let other players join|1. username 2. gameId | Number of players do not exceed the limit| Puts players in waiting room | GET game/waiting-room/:gameId(gameId, playerid, username are all provided via sessions)|
|Redirects to the game room | 1. Game id | Number of players do not exceed the limit |Prepares the game room | GET game/room/:gameId/start (gameId, playerid, username are all provided via sessions)|
|Loads the players into the game room |1. Game id | Number of players do not exceed the limit | Loads in all the players into the game room | GET game/room/:gameId (gameId, playerid, username are all provided via sessions)|
|Allows players to leave the game | 1.Game id 2.Player id | |Player exits the game and they are removed from game and player id is removed from the database | GET game/room/:gameId/leave|
|Create the game itself | 1. Game name 2. Max Players 3. Max rounds | Has to be logged in | Game gets created and updated in the database | POST game/create|
|Player All in | 1. Game id 2. Player id | player can do an action(if they have folded they cannot do anything or if they do not have money) |Takes all the money and puts it in the pot and money is updated in the database,Then continues to next person| HEAD poker/:gameId/allIn (gameId, playerid, username are all provided via sessions)
|Player Fold | 1. Game id 2. Player id | player can do an action (if they have folded they cannot do anything or if they do not have money)|Sets the player’s status to fold so they cannot participate till the round is over.|HEAD poker/:gameId/fold (gameId, playerid, username are all provided via sessions)
|Raise|1. Game id 2. Player id 3. Bet|player can do an action (if they have folded they cannot do anything or if they do not have money)|Increased the minimum bet and adds money to the pot|POST poker/:gameId/raise (gameId, playerid, username are all provided via sessions)|
|Register|1. Username 2. password 3. email | Checks if username or email exists | Adds fields to the database and logs in |POST user/register|
|Login | 1. Email 2. password | Checks if email exists and checks if password is correct| Logs in and redirects you to login page| POST user/login|
|Logout| | |Logs player out | GET user/logout|
















