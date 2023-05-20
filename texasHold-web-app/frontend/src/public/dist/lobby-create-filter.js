/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./public/js/lobby_create_filter.js":
/*!******************************************!*\
  !*** ./public/js/lobby_create_filter.js ***!
  \******************************************/
/***/ (() => {

eval("var openCreateNewGameButton = document.getElementById(\"create-game-open\");\nvar closeCreateNewGameButton = document.getElementById(\"create-game-close\");\nvar createNewGameDialogue = document.getElementById(\"create-game-dialog\");\nopenCreateNewGameButton.addEventListener(\"click\", function () {\n  createNewGameDialogue.showModal();\n});\ncloseCreateNewGameButton.addEventListener(\"click\", function () {\n  createNewGameDialogue.close();\n});\nvar openFilterGamesButton = document.getElementById(\"filter-games-open\");\nvar closeFilterGamesButton = document.getElementById(\"filter-games-close\");\nvar filterGamesDialogue = document.getElementById(\"filter-games-dialog\");\nopenFilterGamesButton.addEventListener(\"click\", function () {\n  filterGamesDialogue.showModal();\n});\ncloseFilterGamesButton.addEventListener(\"click\", function () {\n  filterGamesDialogue.close();\n});\n\n//# sourceURL=webpack:///./public/js/lobby_create_filter.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./public/js/lobby_create_filter.js"]();
/******/ 	
/******/ })()
;