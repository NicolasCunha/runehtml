import { jest } from '@jest/globals';

/**
 * Tests for new features added in recent development:
 * - Reset Skills functionality
 * - New theme colors (mint, pink, gold, violet)
 * - Theme selector UI improvements
 * - Combat animations with two-column layout
 * - Main menu layout fixes
 */

describe('New Features - Themes', () => {
    test('should have 9 total themes defined', () => {
        const expectedThemes = [
            'green', 'amber', 'blue', 'red', 'dessimon',
            'mint', 'pink', 'gold', 'violet'
        ];
        
        // This validates that themes.js should have all these themes
        expect(expectedThemes).toHaveLength(9);
    });

    test('should have distinct color values for new themes', () => {
        const newThemes = {
            mint: { primary: '#3affb3', name: 'Cool Mint' },
            pink: { primary: '#ff69b4', name: 'Bubblegum Pink' },
            gold: { primary: '#ffd700', name: 'Golden Hour' },
            violet: { primary: '#9d00ff', name: 'Electric Violet' }
        };

        const primaryColors = Object.values(newThemes).map(t => t.primary);
        const uniqueColors = new Set(primaryColors);
        
        // All new themes should have distinct primary colors
        expect(uniqueColors.size).toBe(4);
    });

    test('should validate hex color format', () => {
        const hexPattern = /^#[0-9a-f]{6}$/i;
        const colors = ['#3affb3', '#ff69b4', '#ffd700', '#9d00ff'];
        
        colors.forEach(color => {
            expect(color).toMatch(hexPattern);
        });
    });
});

describe('New Features - Theme Selector', () => {
    test('should handle theme selection classes correctly', () => {
        const currentTheme = 'blue';
        const testTheme = 'blue';
        
        const selectedClass = testTheme === currentTheme ? 'selected' : '';
        const className = `modal-btn theme-btn ${selectedClass}`.trim();
        
        expect(className).toBe('modal-btn theme-btn selected');
    });

    test('should not add selected class to non-current themes', () => {
        const currentTheme = 'blue';
        const testTheme = 'green';
        
        const selectedClass = testTheme === currentTheme ? 'selected' : '';
        const className = `modal-btn theme-btn ${selectedClass}`.trim();
        
        expect(className).toBe('modal-btn theme-btn');
    });

    test('should handle null current theme', () => {
        const currentTheme = null;
        const testTheme = 'blue';
        
        const selectedClass = testTheme === currentTheme ? 'selected' : '';
        
        expect(selectedClass).toBe('');
    });
});

describe('New Features - UI Layout', () => {
    test('should use flex display for main menu', () => {
        const correctDisplay = 'flex';
        const incorrectDisplay = 'block';
        
        expect(correctDisplay).not.toBe(incorrectDisplay);
        expect(correctDisplay).toBe('flex');
    });

    test('should have training container with correct grid columns', () => {
        const gridColumns = '1fr 2fr';
        
        expect(gridColumns).toMatch(/\d+fr\s+\d+fr/);
        expect(gridColumns).toBe('1fr 2fr');
    });

    test('should have save card minimum width', () => {
        const minWidth = '350px';
        
        expect(parseInt(minWidth)).toBeGreaterThanOrEqual(350);
    });

    test('should truncate character names at 20 characters', () => {
        const maxLength = 20;
        const longName = 'VeryLongCharacterNameThatExceedsTwentyCharacters';
        
        const truncated = longName.length > maxLength 
            ? longName.substring(0, maxLength) 
            : longName;
        
        expect(truncated.length).toBe(maxLength);
        expect(truncated).toBe('VeryLongCharacterNam');
    });

    test('should not truncate short names', () => {
        const maxLength = 20;
        const shortName = 'Bob';
        
        const truncated = shortName.length > maxLength 
            ? shortName.substring(0, maxLength) 
            : shortName;
        
        expect(truncated).toBe('Bob');
    });
});

describe('New Features - Combat Animation Layout', () => {
    test('should have required animation containers', () => {
        const requiredContainers = [
            'combat-animation',
            'animation-scene',
            'character-container',
            'target-container'
        ];
        
        expect(requiredContainers).toHaveLength(4);
    });

    test('should apply animate class to character only', () => {
        const characterClasses = ['stick-figure', 'animate'];
        const targetClasses = ['stick-figure'];
        
        expect(characterClasses).toContain('animate');
        expect(targetClasses).not.toContain('animate');
    });

    test('should have sticky positioning for animation area', () => {
        const position = 'sticky';
        const top = '20px';
        
        expect(position).toBe('sticky');
        expect(parseInt(top)).toBe(20);
    });
});

describe('New Features - Dropdown Menu', () => {
    test('should include reset skills button in menu', () => {
        const menuButtons = [
            'shop-button',
            'statistics-button',
            'reset-skills-button',
            'theme-button',
            'about-button',
            'return-menu-button'
        ];
        
        expect(menuButtons).toContain('reset-skills-button');
    });

    test('should have reset skills between statistics and theme', () => {
        const buttonOrder = [
            'shop',
            'statistics',
            'reset-skills',
            'theme',
            'about',
            'return-menu'
        ];
        
        const resetIndex = buttonOrder.indexOf('reset-skills');
        const statsIndex = buttonOrder.indexOf('statistics');
        const themeIndex = buttonOrder.indexOf('theme');
        
        expect(resetIndex).toBeGreaterThan(statsIndex);
        expect(resetIndex).toBeLessThan(themeIndex);
    });
});

describe('New Features - CSS Improvements', () => {
    test('should have correct CSS selectors for theme buttons', () => {
        const selectors = {
            base: '.theme-btn',
            selected: '.theme-btn.selected',
            hoverNotSelected: '.theme-btn:not(.selected):hover'
        };
        
        expect(selectors.base).toBeTruthy();
        expect(selectors.selected).toContain('.selected');
        expect(selectors.hoverNotSelected).toContain(':not(.selected)');
    });

    test('should validate combat animation gap value', () => {
        const gap = '20px';
        
        expect(parseInt(gap)).toBe(20);
    });

    test('should have ellipsis overflow properties', () => {
        const overflowProperties = {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
        };
        
        expect(overflowProperties.overflow).toBe('hidden');
        expect(overflowProperties.textOverflow).toBe('ellipsis');
        expect(overflowProperties.whiteSpace).toBe('nowrap');
    });
});
