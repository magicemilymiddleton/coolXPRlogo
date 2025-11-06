/**
 * Seed of Life WordPress Plugin JavaScript
 * Version: 4.3.0
 * With auto-start and control visibility options
 */

(function() {
    'use strict';
    
    console.log('[SeedOfLife] Version 4.3 - Auto-start and control options!');
    
    /**
     * Create a new Seed of Life instance
     */
    function initSeedOfLife(canvasId) {
        let canvas, ctx, centerX, centerY, baseRadius;
        let animationFrame = 0;
        let isAnimating = false;
        let animationId = null;
        
        // Configuration
        const config = {
            radiusRatio: 0.2,
            staticOpacity: 0.3  // Opacity for the static background layer
        };
        
        // Color definitions
        const colors = {
            // The 6 outer circles
            circles: [
                '#000000',  // Black (top)
                '#00FF00',  // Green (top-right)
                '#FF0000',  // Red (right)
                '#8B4513',  // Brown (bottom-right)
                '#0000FF',  // Blue (bottom-left)
                '#00CED1'   // Cyan (left)
            ],
            // The 6 four-circle overlap regions
            fourOverlaps: [
                '#bc01bc',  // Purple
                '#dfff17',  // Yellow-green
                '#dddddd',  // Light gray
                '#040404',  // Near black
                '#f50018',  // Red
                '#f4a301'   // Orange
            ],
            center: 'rgba(240, 240, 240, 0.5)',
            border: 'white',
            background: 'white'
        };
        
        /**
         * Initialize
         */
        function init() {
            canvas = document.getElementById(canvasId);
            if (!canvas) {
                console.error(`Canvas not found: #${canvasId}`);
                return null;
            }
            
            ctx = canvas.getContext('2d');
            centerX = canvas.width / 2;
            centerY = canvas.height / 2;
            baseRadius = canvas.width * config.radiusRatio;
            
            attachEventListeners();
            draw();
            
            console.log('✅ Seed of Life initialized - with auto-start capability!');
            return api;
        }
        
        /**
         * Draw a single Seed of Life pattern
         * @param {number} rotation - Rotation angle in radians
         * @param {number} globalOpacity - Overall opacity for this layer
         */
        function drawSeedPattern(rotation = 0, globalOpacity = 1) {
            ctx.save();
            
            // Apply rotation
            ctx.translate(centerX, centerY);
            ctx.rotate(rotation);
            ctx.translate(-centerX, -centerY);
            
            // Calculate positions of the 6 outer circles
            const circles = [];
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI / 3) - Math.PI / 2;
                circles.push({
                    x: centerX + Math.cos(angle) * baseRadius,
                    y: centerY + Math.sin(angle) * baseRadius
                });
            }
            
            // =========================================
            // LAYER 1: Base circles
            // =========================================
            ctx.globalAlpha = 0.8 * globalOpacity;
            circles.forEach((circle, i) => {
                ctx.beginPath();
                ctx.arc(circle.x, circle.y, baseRadius, 0, Math.PI * 2);
                ctx.fillStyle = colors.circles[i];
                ctx.fill();
            });
            
            // Center circle
            ctx.beginPath();
            ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
            ctx.fillStyle = colors.center;
            ctx.fill();
            
            // =========================================
            // LAYER 2: The 6 FOUR-CIRCLE OVERLAP regions
            // =========================================
            for (let i = 0; i < 6; i++) {
                ctx.save();
                
                // Get three consecutive outer circles
                const c1 = circles[i];
                const c2 = circles[(i + 1) % 6];
                const c3 = circles[(i + 2) % 6];
                
                // Create 4-way intersection
                ctx.beginPath();
                ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
                ctx.clip();
                
                ctx.beginPath();
                ctx.arc(c1.x, c1.y, baseRadius, 0, Math.PI * 2);
                ctx.clip();
                
                ctx.beginPath();
                ctx.arc(c2.x, c2.y, baseRadius, 0, Math.PI * 2);
                ctx.clip();
                
                ctx.beginPath();
                ctx.arc(c3.x, c3.y, baseRadius, 0, Math.PI * 2);
                ctx.fillStyle = colors.fourOverlaps[i];
                ctx.globalAlpha = 0.9 * globalOpacity;
                ctx.fill();
                
                ctx.restore();
            }
            
            // =========================================
            // LAYER 3: White borders
            // =========================================
            ctx.globalAlpha = 1 * globalOpacity;
            ctx.strokeStyle = colors.border;
            ctx.lineWidth = 3;
            
            // Outer circle borders
            circles.forEach(circle => {
                ctx.beginPath();
                ctx.arc(circle.x, circle.y, baseRadius, 0, Math.PI * 2);
                ctx.stroke();
            });
            
            // Center circle border
            ctx.beginPath();
            ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            // =========================================
            // LAYER 4: White circle background for yin-yang
            // =========================================
            ctx.globalAlpha = 1 * globalOpacity;
            ctx.beginPath();
            ctx.arc(centerX, centerY, baseRadius * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
            
            // =========================================
            // LAYER 5 (TOP): Yin-Yang and Aleph
            // These go on TOP of everything!
            // =========================================
            ctx.globalAlpha = 1 * globalOpacity;
            drawYinYang(centerX, centerY, baseRadius * 0.28);
            drawAleph(centerX, centerY, baseRadius * 0.36, baseRadius);
            
            ctx.restore();
        }
        
        /**
         * Main drawing function
         */
function draw(rotation = 0) {
  // 1) Clear everything first (so outside the circle is transparent)
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 2) Clip the whole frame to a circle
  ctx.save();
  const clipR = Math.min(canvas.width, canvas.height) / 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, clipR, 0, Math.PI * 2);
  ctx.clip();

  // 3) Fill a white circular background instead of a square
  ctx.fillStyle = colors.background;   // stays 'white'
  ctx.beginPath();
  ctx.arc(centerX, centerY, clipR, 0, Math.PI * 2);
  ctx.fill();

  // 4) Draw everything as usual inside the circle
  drawSeedPattern(0, config.staticOpacity);
  drawSeedPattern(rotation, 1);

  // 5) Stop clipping
  ctx.restore();
}

        
        /**
         * Draw Yin-Yang symbol
         */
        function drawYinYang(x, y, radius) {
            ctx.save();
            
            // White background
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Black half
            ctx.beginPath();
            ctx.arc(x, y, radius, Math.PI/2, -Math.PI/2);
            ctx.lineTo(x, y - radius);
            ctx.fillStyle = 'black';
            ctx.fill();
            
            // Black small circle
            ctx.beginPath();
            ctx.arc(x, y - radius/2, radius/2, 0, Math.PI * 2);
            ctx.fillStyle = 'black';
            ctx.fill();
            
            // White small circle
            ctx.beginPath();
            ctx.arc(x, y + radius/2, radius/2, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
            
            // White dot
            ctx.beginPath();
            ctx.arc(x, y - radius/2, radius/6, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
            
            // Black dot
            ctx.beginPath();
            ctx.arc(x, y + radius/2, radius/6, 0, Math.PI * 2);
            ctx.fillStyle = 'black';
            ctx.fill();
            
            ctx.restore();
        }
        
        /**
         * Draw Aleph symbol with inverted colors based on yin-yang
         */
        function drawAleph(x, y, size, radius) {
            ctx.save();
            
            // Set up font
            ctx.font = `bold ${size}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw WHITE Aleph on the BLACK (left) side
            ctx.save();
            // Clip to left half
            ctx.beginPath();
            ctx.rect(0, 0, x, canvas.height);
            ctx.clip();
            ctx.fillStyle = 'transparent';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;
            ctx.fillText('א', x, y + 2);
            ctx.strokeText('א', x, y + 2);  // Add thin outline for visibility
            ctx.restore();
            
            // Draw BLACK Aleph on the WHITE (right) side
            ctx.save();
            // Clip to right half
            ctx.beginPath();
            ctx.rect(x, 0, canvas.width, canvas.height);
            ctx.clip();
            ctx.fillStyle = 'black';
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 1;
            ctx.fillText('א', x, y + 2);
            ctx.strokeText('א', x, y + 2);  // Add thin outline for visibility
            ctx.restore();
            
            ctx.restore();
        }
        
        /**
         * Animation loop
         */
        function animate() {
            if (isAnimating) {
                animationFrame += 0.005;
                draw(animationFrame);
                animationId = requestAnimationFrame(animate);
            }
        }
        
        /**
         * Start animation (for auto-start feature)
         */
        function startAnimation() {
            if (!isAnimating) {
                isAnimating = true;
                animate();
                canvas.style.cursor = 'default';
                canvas.classList.add('animating');
            }
        }
        
        /**
         * Stop animation
         */
        function stopAnimation() {
            isAnimating = false;
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            canvas.style.cursor = 'grab';
            canvas.classList.remove('animating');
        }
        
        /**
         * Toggle animation
         */
        function toggleAnimation() {
            if (isAnimating) {
                stopAnimation();
            } else {
                startAnimation();
            }
        }
        
        /**
         * Reset
         */
        function reset() {
            stopAnimation();
            animationFrame = 0;
            draw();
        }
        
        /**
         * Event listeners
         */
        function attachEventListeners() {
            let isDragging = false;
            let lastMouseX = 0;
            
            canvas.addEventListener('mousedown', (e) => {
                if (!isAnimating) {
                    isDragging = true;
                    lastMouseX = e.clientX;
                    canvas.style.cursor = 'grabbing';
                }
            });
            
            canvas.addEventListener('mousemove', (e) => {
                if (isDragging && !isAnimating) {
                    const deltaX = e.clientX - lastMouseX;
                    animationFrame += deltaX * 0.01;
                    draw(animationFrame);
                    lastMouseX = e.clientX;
                }
            });
            
            canvas.addEventListener('mouseup', () => {
                isDragging = false;
                if (!isAnimating) {
                    canvas.style.cursor = 'grab';
                }
            });
            
            canvas.addEventListener('mouseleave', () => {
                isDragging = false;
                if (!isAnimating) {
                    canvas.style.cursor = 'grab';
                }
            });
            
            canvas.addEventListener('touchstart', (e) => {
                if (!isAnimating) {
                    isDragging = true;
                    lastMouseX = e.touches[0].clientX;
                    e.preventDefault();
                }
            });
            
            canvas.addEventListener('touchmove', (e) => {
                if (isDragging && !isAnimating) {
                    const deltaX = e.touches[0].clientX - lastMouseX;
                    animationFrame += deltaX * 0.01;
                    draw(animationFrame);
                    lastMouseX = e.touches[0].clientX;
                    e.preventDefault();
                }
            });
            
            canvas.addEventListener('touchend', () => {
                isDragging = false;
            });
            
            canvas.style.cursor = 'grab';
        }
        
        // Public API
        const api = {
            toggleAnimation,
            startAnimation,  // NEW: Exposed for auto-start feature
            stopAnimation,   // NEW: Exposed for better control
            reset,
            draw,
            setStaticOpacity: function(opacity) {
                config.staticOpacity = Math.max(0, Math.min(1, opacity));
                draw(animationFrame);
            },
            setLayerEffect: function(enabled, bgOpacity, fgOpacity) {
                if (enabled) {
                    config.staticOpacity = parseFloat(bgOpacity) || 0.3;
                } else {
                    config.staticOpacity = 0;
                }
                draw(animationFrame);
            }
        };
        
        // Initialize
        return init();
    }
    
    // Make globally available
    window.initSeedOfLife = initSeedOfLife;
    
    console.log('%c🌸 Seed of Life v4.3 - Auto-start ready!', 
               'color: #FF1493; font-size: 14px; font-weight: bold');
})();