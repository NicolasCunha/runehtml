/**
 * Handles rendering of skill training animations
 */
class AnimationRenderer {
    /**
     * Render skill training animation
     * @param {HTMLElement} animationArea - The animation area element
     * @param {string} skillKey - The skill being trained
     * @param {number} level - The current skill level
     */
    render(animationArea, skillKey, level) {
        if (!animationArea) return;
        
        // Get the appropriate animation based on level
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
