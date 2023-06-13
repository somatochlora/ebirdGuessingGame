import {createGame} from './modules/game.js';
import {createMainMenu} from './modules/mainMenu.js';

const newGame = (rounds, gameType) => {
    document.querySelector("body").textContent = "";
    document.querySelector("body").append(createGame(rounds, gameType, mainMenu));
}

const mainMenu = () => {
    document.querySelector("body").textContent = "";
    document.querySelector("body").append(createMainMenu(newGame));
}

mainMenu();