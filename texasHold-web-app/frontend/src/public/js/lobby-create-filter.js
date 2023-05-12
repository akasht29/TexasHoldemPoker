const openCreateNewGameButton  = document.getElementById("create-game-open");
const closeCreateNewGameButton = document.getElementById("create-game-close");
const createNewGameDialogue    = document.getElementById("create-game-dialog");

openCreateNewGameButton.addEventListener("click", () => {
    createNewGameDialogue.showModal();
})

closeCreateNewGameButton.addEventListener("click", () => {
    createNewGameDialogue.close();
})

const openFilterGamesButton  = document.getElementById("filter-games-open");
const closeFilterGamesButton = document.getElementById("filter-games-close");
const filterGamesDialogue    = document.getElementById("filter-games-dialog");

openFilterGamesButton.addEventListener("click", () => {
    filterGamesDialogue.showModal();
})

closeFilterGamesButton.addEventListener("click", () => {
    filterGamesDialogue.close();
})