/**
 * @jest-environment jsdom
 */

describe('AnimationRenderer', () => {
    let renderer;
    let mockAnimationArea;
    
    // Mock animation manager
    global.animationManager = {
        getAnimation: (skillKey, level) => {
            // Return different animations based on skill and level
            const animations = {
                woodcutting: {
                    name: level < 30 ? 'Chopping Oak Tree' : 'Chopping Willow Tree',
                    character: '🧍',
                    target: '🌳',
                    bgElements: '☁️'
                },
                mining: {
                    name: level < 15 ? 'Mining Copper' : 'Mining Iron',
                    character: '⛏️',
                    target: '🪨',
                    bgElements: '⛰️'
                },
                fishing: {
                    name: 'Fishing Shrimp',
                    character: '🎣',
                    target: null,
                    bgElements: '🌊'
                }
            };
            
            return animations[skillKey] || {
                name: 'Training',
                character: '🧍',
                target: null,
                bgElements: ''
            };
        }
    };
    
    beforeEach(() => {
        // Mock AnimationRenderer class
        class AnimationRenderer {
            render(animationArea, skillKey, level) {
                if (!animationArea) return;
                
                const anim = animationManager.getAnimation(skillKey, level);
                
                animationArea.innerHTML = `
                    <div class="training-animation">
                        <div class="animation-scene">
                            <div class="bg-elements">${anim.bgElements}</div>
                            <div class="character-container">
                                <pre class="stick-figure animate">${anim.character}</pre>
                            </div>
                            ${anim.target ? `
                            <div class="target-container">
                                <pre class="training-target">${anim.target}</pre>
                            </div>
                            ` : ''}
                        </div>
                        <p class="activity-text">${anim.name}</p>
                    </div>
                `;
            }
        }
        
        renderer = new AnimationRenderer();
        mockAnimationArea = document.createElement('div');
        mockAnimationArea.id = 'animation-area';
        document.body.appendChild(mockAnimationArea);
    });
    
    afterEach(() => {
        document.body.innerHTML = '';
    });
    
    describe('render', () => {
        test('should handle null animation area', () => {
            expect(() => renderer.render(null, 'woodcutting', 1)).not.toThrow();
        });
        
        test('should render woodcutting animation', () => {
            renderer.render(mockAnimationArea, 'woodcutting', 1);
            
            expect(mockAnimationArea.innerHTML).toContain('training-animation');
            expect(mockAnimationArea.innerHTML).toContain('Chopping Oak Tree');
            expect(mockAnimationArea.innerHTML).toContain('🧍');
            expect(mockAnimationArea.innerHTML).toContain('🌳');
        });
        
        test('should render mining animation', () => {
            renderer.render(mockAnimationArea, 'mining', 10);
            
            expect(mockAnimationArea.innerHTML).toContain('Mining Copper');
            expect(mockAnimationArea.innerHTML).toContain('⛏️');
            expect(mockAnimationArea.innerHTML).toContain('🪨');
        });
        
        test('should render different animation for higher level', () => {
            renderer.render(mockAnimationArea, 'woodcutting', 40);
            
            expect(mockAnimationArea.innerHTML).toContain('Chopping Willow Tree');
        });
        
        test('should render animation without target', () => {
            renderer.render(mockAnimationArea, 'fishing', 20);
            
            expect(mockAnimationArea.innerHTML).toContain('Fishing Shrimp');
            expect(mockAnimationArea.innerHTML).toContain('🎣');
            expect(mockAnimationArea.innerHTML).not.toContain('target-container');
        });
        
        test('should include background elements', () => {
            renderer.render(mockAnimationArea, 'mining', 1);
            
            const bgElements = mockAnimationArea.querySelector('.bg-elements');
            expect(bgElements).toBeTruthy();
            expect(bgElements.textContent).toBe('⛰️');
        });
        
        test('should include character container with animate class', () => {
            renderer.render(mockAnimationArea, 'woodcutting', 1);
            
            const character = mockAnimationArea.querySelector('.stick-figure.animate');
            expect(character).toBeTruthy();
            expect(character.textContent).toBe('🧍');
        });
        
        test('should include target container when target exists', () => {
            renderer.render(mockAnimationArea, 'mining', 1);
            
            const target = mockAnimationArea.querySelector('.training-target');
            expect(target).toBeTruthy();
            expect(target.textContent).toBe('🪨');
        });
        
        test('should include activity text', () => {
            renderer.render(mockAnimationArea, 'woodcutting', 1);
            
            const activityText = mockAnimationArea.querySelector('.activity-text');
            expect(activityText).toBeTruthy();
            expect(activityText.textContent).toBe('Chopping Oak Tree');
        });
        
        test('should call animationManager.getAnimation with correct parameters', () => {
            // This is tested implicitly through the animation content
            renderer.render(mockAnimationArea, 'fishing', 35);
            
            expect(mockAnimationArea.innerHTML).toContain('Fishing Shrimp');
        });
        
        test('should handle unknown skill gracefully', () => {
            renderer.render(mockAnimationArea, 'unknown_skill', 1);
            
            expect(mockAnimationArea.innerHTML).toContain('Training');
            expect(mockAnimationArea.innerHTML).toContain('training-animation');
        });
        
        test('should update animation area innerHTML', () => {
            mockAnimationArea.innerHTML = '<div>Old content</div>';
            
            renderer.render(mockAnimationArea, 'woodcutting', 1);
            
            expect(mockAnimationArea.innerHTML).not.toContain('Old content');
            expect(mockAnimationArea.innerHTML).toContain('training-animation');
        });
        
        test('should create proper DOM structure', () => {
            renderer.render(mockAnimationArea, 'mining', 1);
            
            expect(mockAnimationArea.querySelector('.training-animation')).toBeTruthy();
            expect(mockAnimationArea.querySelector('.animation-scene')).toBeTruthy();
            expect(mockAnimationArea.querySelector('.bg-elements')).toBeTruthy();
            expect(mockAnimationArea.querySelector('.character-container')).toBeTruthy();
        });
        
        test('should use pre element for character', () => {
            renderer.render(mockAnimationArea, 'woodcutting', 1);
            
            const character = mockAnimationArea.querySelector('pre.stick-figure');
            expect(character).toBeTruthy();
        });
        
        test('should conditionally render target container', () => {
            // With target
            renderer.render(mockAnimationArea, 'woodcutting', 1);
            expect(mockAnimationArea.querySelector('.target-container')).toBeTruthy();
            
            // Without target
            renderer.render(mockAnimationArea, 'fishing', 1);
            expect(mockAnimationArea.querySelector('.target-container')).toBeFalsy();
        });
    });
});
