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
        
        // Check if target has an image
        let targetHTML = '';
        if (anim.targetImage) {
            targetHTML = `
                <div class="target-container">
                    <img src="${anim.targetImage}" 
                         alt="${anim.name}" 
                         class="training-target-image"
                         style="width: 64px; height: 64px; image-rendering: pixelated; image-rendering: crisp-edges;">
                </div>
            `;
        } else if (anim.target) {
            targetHTML = `
                <div class="target-container">
                    <pre class="training-target">${anim.target}</pre>
                </div>
            `;
        }
        
        animationArea.innerHTML = `
            <div class="training-animation">
                <div class="animation-scene">
                    <div class="bg-elements">${anim.bgElements}</div>
                    <div class="character-container">
                        <pre class="stick-figure animate">${anim.character}</pre>
                    </div>
                    ${targetHTML}
                </div>
                <p class="activity-text">${anim.name}</p>
            </div>
        `;
    }
}
