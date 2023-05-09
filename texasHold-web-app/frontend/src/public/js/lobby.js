import { register } from "./register";
import { login } from "./login";
import { logout } from "./logout";
import { createGame, joinGame, getGameList } from "./game";




//Fetch lobby is used because it requires the token
export async function fetchLobby() {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch("/user/lobby", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const lobbyHtml = await response.text();

        if (response.status === 200) {
            location.href="/user/lobby"
        
            setInterval(() => {
            // getGameList();
            }, 10000);
        }
        else {
            console.error("Error fetching lobby:", lobbyHtml);
        }
    } catch (error) {
        console.error("Error fetching lobby:", error);
    }
}

export function handleRegisterAndLoginForm() {
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");
    const logoutBtn = document.getElementById("logout");

    if (registerForm) {
        registerForm.addEventListener("submit", (event) => {
            event.preventDefault();
            register(event);
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();
            login(event);
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", (event) => {
            event.preventDefault();
            logout();
        });
    }
}

export function showCreateGameModal() {
    const createGameModal = document.getElementById("create-game-modal");

    if (createGameModal) {
        createGameModal.removeAttribute("hidden");
        console.log("Show create game modal button clicked");
    } else {
        console.error("Open Create game modal not found");
    }
}

export function closeCreateGameModal() {
    const createGameModal = document.getElementById("create-game-modal");

    if (createGameModal) {
        createGameModal.setAttribute("hidden", "true");
        console.log("close create game modal button clicked");
    } else {
        console.error("Close create game modal not found");
    }
}

export function handleCreateGame() {
    const createGameForm = document.getElementById("create-game-form");
    const gameListElement = document.getElementById("game-list");

    if (createGameForm) {
        createGameForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            await createGame();
        });
    }

    if (gameListElement) {
        gameListElement.addEventListener("click", (event) => {
            if (event.target.classList.contains("join-game")) {
                const gameId = event.target.parentElement.dataset.gameId;
                joinGame(gameId);
            }
        });
    }
}