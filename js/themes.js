// Theme Manager - Handles terminal color schemes
// Provides different retro terminal themes while maintaining the aesthetic

class ThemeManager {
    constructor() {
        this.themes = {
            green: {
                name: 'Classic Green',
                primary: '#00ff00',
                primaryDim: '#33dd33',
                primaryDark: '#008800',
                glow: 'rgba(0, 255, 0, 0.5)',
                glowStrong: 'rgba(0, 255, 0, 0.8)'
            },
            amber: {
                name: 'Amber Monochrome',
                primary: '#ffb000',
                primaryDim: '#dd9933',
                primaryDark: '#aa6600',
                glow: 'rgba(255, 176, 0, 0.5)',
                glowStrong: 'rgba(255, 176, 0, 0.8)'
            },
            blue: {
                name: 'IBM Blue',
                primary: '#00d4ff',
                primaryDim: '#33bbdd',
                primaryDark: '#0088aa',
                glow: 'rgba(0, 212, 255, 0.5)',
                glowStrong: 'rgba(0, 212, 255, 0.8)'
            },
            red: {
                name: 'Soviet Red',
                primary: '#ff3333',
                primaryDim: '#dd5555',
                primaryDark: '#aa0000',
                glow: 'rgba(255, 51, 51, 0.5)',
                glowStrong: 'rgba(255, 51, 51, 0.8)'
            },
            dessimon: {
                name: 'Dessimon',
                primary: '#d946ef',
                primaryDim: '#c084fc',
                primaryDark: '#9333ea',
                glow: 'rgba(217, 70, 239, 0.6)',
                glowStrong: 'rgba(192, 132, 252, 0.9)'
            }
        };
        
        this.currentTheme = 'green';
    }
    
    /**
     * Get all available themes
     * @param {string} playerName - Optional player name to check for special theme access
     * @returns {Object} - Object with theme keys and names
     */
    getThemes(playerName = null) {
        const themeList = {};
        for (const [key, theme] of Object.entries(this.themes)) {
            // Dessimon theme is only available to SwagLordMessiah2000
            if (key === 'dessimon' && playerName !== 'SwagLordMessiah2000') {
                continue;
            }
            themeList[key] = theme.name;
        }
        return themeList;
    }
    
    /**
     * Apply a theme to the document
     * @param {string} themeKey - The theme to apply
     */
    applyTheme(themeKey) {
        if (!this.themes[themeKey]) {
            themeKey = 'green'; // Default to green if invalid
        }
        
        const theme = this.themes[themeKey];
        this.currentTheme = themeKey;
        
        // Set CSS custom properties
        const root = document.documentElement;
        root.style.setProperty('--color-primary', theme.primary);
        root.style.setProperty('--color-primary-dim', theme.primaryDim);
        root.style.setProperty('--color-primary-dark', theme.primaryDark);
        root.style.setProperty('--color-glow', theme.glow);
        root.style.setProperty('--color-glow-strong', theme.glowStrong);
        
        // Store theme preference
        localStorage.setItem('runehtml_theme', themeKey);
    }
    
    /**
     * Get the current theme key
     * @returns {string} - Current theme key
     */
    getCurrentTheme() {
        return this.currentTheme;
    }
    
    /**
     * Load theme from localStorage or use default
     */
    loadSavedTheme() {
        const saved = localStorage.getItem('runehtml_theme');
        if (saved && this.themes[saved]) {
            this.applyTheme(saved);
        } else {
            this.applyTheme('green');
        }
    }
}

// Export the theme manager
const themeManager = new ThemeManager();
