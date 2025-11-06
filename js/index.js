// RuneHTML - Terminal Idle Game
// Main JavaScript File

class Game {
    constructor() {
        this.gameState = {
            isPlaying: false,
            player: {
                name: 'Player',
                level: 1,
                experience: 0
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupMenuListeners();
        console.log('RuneHTML initialized...');
    }
    
    setupMenuListeners() {
        const menuItems = document.querySelectorAll('.menu-item');
        
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const action = item.getAttribute('data-action');
                this.handleMenuAction(action);
            });
        });
    }
    
    handleMenuAction(action) {
        switch(action) {
            case 'new-game':
                this.startNewGame();
                break;
            case 'load-game':
                this.loadGame();
                break;
            default:
                console.log('Unknown action:', action);
        }
    }
    
    startNewGame() {
        console.log('Starting new game...');
        // Hide main menu
        const mainMenu = document.getElementById('main-menu');
        const logo = document.querySelector('.logo');
        
        mainMenu.style.display = 'none';
        logo.style.display = 'none';
        
        // Show game area
        const gameArea = document.getElementById('game-area');
        gameArea.style.display = 'block';
        gameArea.innerHTML = `
            <div class="game-message">
                <p>> Initializing new game...</p>
                <br>
                <p>> Loading world data...</p>
                <br>
                <p>> Welcome, adventurer!</p>
                <br><br>
                <p style="color: #ffff00;">[Game mechanics will be implemented here]</p>
            </div>
        `;
        
        this.gameState.isPlaying = true;
    }
    
    loadGame() {
        const savedGame = localStorage.getItem('runehtml_save');
        
        if (savedGame) {
            console.log('Loading saved game...');
            this.gameState = JSON.parse(savedGame);
            
            // Hide main menu and show game
            document.getElementById('main-menu').style.display = 'none';
            document.querySelector('.logo').style.display = 'none';
            
            const gameArea = document.getElementById('game-area');
            gameArea.style.display = 'block';
            gameArea.innerHTML = `
                <div class="game-message">
                    <p>> Loading saved game...</p>
                    <br>
                    <p>> Welcome back, ${this.gameState.player.name}!</p>
                    <br>
                    <p>> Level: ${this.gameState.player.level}</p>
                    <br><br>
                    <p style="color: #ffff00;">[Game will resume here]</p>
                </div>
            `;
            
            this.gameState.isPlaying = true;
        } else {
            // No saved game found
            const gameArea = document.getElementById('game-area');
            gameArea.style.display = 'block';
            document.getElementById('main-menu').style.display = 'none';
            document.querySelector('.logo').style.display = 'none';
            
            gameArea.innerHTML = `
                <div class="game-message">
                    <p style="color: #ff0000;">> ERROR: No saved game found!</p>
                    <br><br>
                    <p>> Press any key to return to menu...</p>
                </div>
            `;
            
            // Return to menu after a delay
            setTimeout(() => {
                gameArea.style.display = 'none';
                document.getElementById('main-menu').style.display = 'block';
                document.querySelector('.logo').style.display = 'block';
            }, 2000);
        }
    }
    
    saveGame() {
        localStorage.setItem('runehtml_save', JSON.stringify(this.gameState));
        console.log('Game saved!');
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    
    // Make game instance globally accessible for debugging
    window.game = game;
});
