/**
 * Seed of Life WordPress Plugin JavaScript
 * Version: 1.0.0
 * With comprehensive debugging
 */

(function() {
    'use strict';
    
    console.log('[SeedOfLife] JavaScript file loaded');
    
    // Debug configuration
    const DEBUG = {
        enabled: true,
        verbose: true,
        logColors: true,
        logPerformance: true
    };
    
    // Global state tracking
    const globalState = {
        instances: {},
        instanceCount: 0
    };
    
    /**
     * Create a new Seed of Life instance
     */
    function initSeedOfLife(canvasId) {
        console.log(`[SeedOfLife] Initializing instance for canvas: ${canvasId}`);
        
        // State tracking for this instance
        const state = {
            initialized: false,
            canvasFound: false,
            contextCreated: false,
            eventsAttached: false,
            drawCount: 0,
            errors: [],
            warnings: [],
            colorCache: {},
            lastAction: null,
            animationFrameCount: 0
        };
        
        let canvas, ctx, centerX, centerY, baseRadius;
        let animationFrame = 0;
        let isAnimating = false;
        let animationId = null;
        let startTime = Date.now();
        
        // Configuration
        const config = {
            radiusRatio: 0.16,
            opacity: {
                primary: 0.7,
                intersection: 0.8,
                centerPetal: 0.6,
                center: 0.5
            },
            layerEffect: {
                enabled: true,
                backgroundOpacity: 0.25,  // More transparent background
                foregroundOpacity: 1.0     // Fully opaque foreground
            }
        };
        
        /**
         * Logging function
         */
        function log(message, type = 'info', data = null) {
            if (!DEBUG.enabled) return;
            
            const timestamp = ((Date.now() - startTime) / 1000).toFixed(3);
            const prefix = `[SeedOfLife-${canvasId} ${timestamp}s]`;
            
            const styles = {
                info: 'color: #2196F3',
                success: 'color: #4CAF50',
                warning: 'color: #FF9800; font-weight: bold',
                error: 'color: #F44336; font-weight: bold',
                debug: 'color: #9C27B0',
                performance: 'color: #00BCD4'
            };
            
            if (DEBUG.logColors) {
                console.log(`%c${prefix} ${message}`, styles[type] || styles.info, data || '');
            } else {
                console.log(`${prefix} [${type.toUpperCase()}] ${message}`, data || '');
            }
            
            if (type === 'error') {
                state.errors.push({ time: timestamp, message, data });
            } else if (type === 'warning') {
                state.warnings.push({ time: timestamp, message, data });
            }
        }
        
        /**
         * Get color from CSS class
         */
        function getColorFromClass(className) {
            log(`Retrieving color for class: ${className}`, 'debug');
            
            if (state.colorCache[className]) {
                log(`Color found in cache: ${className} = ${state.colorCache[className]}`, 'debug');
                return state.colorCache[className];
            }
            
            try {
                const element = document.createElement('div');
                element.className = className;
                element.style.display = 'none';
                document.body.appendChild(element);
                const styles = window.getComputedStyle(element);
                const color = styles.fill || styles.backgroundColor || '#000000';
                document.body.removeChild(element);
                
                state.colorCache[className] = color;
                
                if (color === '#000000' && className !== 'sol-border') {
                    log(`Warning: Default black color for ${className}, CSS class may not be defined`, 'warning');
                } else {
                    log(`Color retrieved: ${className} = ${color}`, 'success');
                }
                
                return color;
            } catch (error) {
                log(`Error retrieving color for ${className}: ${error.message}`, 'error', error);
                return '#000000';
            }
        }
        
        /**
         * Initialize the canvas
         */
        function init() {
            log('Starting initialization', 'info');
            
            canvas = document.getElementById(canvasId);
            if (!canvas) {
                log(`Canvas element not found: #${canvasId}`, 'error');
                state.canvasFound = false;
                return null;
            }
            
            state.canvasFound = true;
            log(`Canvas found: ${canvas.width}x${canvas.height}`, 'success');
            
            try {
                ctx = canvas.getContext('2d');
                state.contextCreated = true;
                log('2D context created successfully', 'success');
            } catch (error) {
                log('Failed to create 2D context', 'error', error);
                return null;
            }
            
            centerX = canvas.width / 2;
            centerY = canvas.height / 2;
            baseRadius = canvas.width * config.radiusRatio;
            
            log(`Canvas dimensions: Center(${centerX}, ${centerY}), Radius: ${baseRadius}`, 'info');
            
            // Test CSS classes
            log('Testing CSS classes...', 'info');
            const testClasses = ['sol-circle-1', 'sol-petal-1-2', 'sol-center-petal-1'];
            let cssLoaded = true;
            testClasses.forEach(className => {
                const color = getColorFromClass(className);
                if (!color || color === '#000000' || color === 'rgba(0, 0, 0, 0)' || color === 'transparent') {
                    log(`CSS class ${className} not properly defined`, 'warning');
                    cssLoaded = false;
                }
            });
            
            if (!cssLoaded) {
                log('Some CSS classes are missing. Using fallback colors.', 'warning');
            }
            
            attachEventListeners();
            draw();
            
            state.initialized = true;
            log('Initialization complete', 'success', state);
            
            return api; // Return the API
        }
        
        /**
         * Draw function with optional background layer
         */
        function draw(rotation = 0, isBackgroundLayer = false) {
            if (!isBackgroundLayer) {
                state.drawCount++;
                state.lastAction = 'draw';
                log(`Draw #${state.drawCount} with rotation: ${rotation.toFixed(3)}`, 'debug');
            }
            
            // Only clear canvas for the first layer
            if (!isBackgroundLayer && !isAnimating) {
                const bgColor = getColorFromClass('sol-background') || '#FFFFFF';
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            
            // Save context state for this layer
            ctx.save();
            
            // Set layer opacity - make the effect more dramatic
            let layerOpacity = 1.0;
            if (isAnimating && config.layerEffect.enabled) {
                layerOpacity = isBackgroundLayer ? 0.2 : 0.9;  // Strong contrast
                
                // Add slight scale effect for background
                if (isBackgroundLayer) {
                    ctx.translate(centerX, centerY);
                    ctx.scale(0.95, 0.95);  // Slightly smaller background
                    ctx.translate(-centerX, -centerY);
                }
            }
            
            // Calculate circle positions
            const circles = [];
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI / 3) - Math.PI / 2 + rotation;
                circles.push({
                    x: centerX + Math.cos(angle) * baseRadius,
                    y: centerY + Math.sin(angle) * baseRadius,
                    index: i + 1,
                    color: getColorFromClass(`sol-circle-${i + 1}`) || '#CCCCCC'
                });
            }
            
            // Draw primary circles with layer-specific opacity
            ctx.globalAlpha = config.opacity.primary * layerOpacity;
            circles.forEach(circle => {
                ctx.beginPath();
                ctx.arc(circle.x, circle.y, baseRadius, 0, Math.PI * 2);
                ctx.fillStyle = circle.color;
                ctx.fill();
            });
            
            // Draw petal intersections
            ctx.globalAlpha = config.opacity.intersection * layerOpacity;
            for (let i = 0; i < circles.length; i++) {
                const circle1 = circles[i];
                const circle2 = circles[(i + 1) % circles.length];
                const petalColor = getColorFromClass(`sol-petal-${circle1.index}-${circle2.index}`) || '#DDDDDD';
                
                ctx.save();
                ctx.beginPath();
                ctx.arc(circle1.x, circle1.y, baseRadius, 0, Math.PI * 2);
                ctx.clip();
                
                ctx.beginPath();
                ctx.arc(circle2.x, circle2.y, baseRadius, 0, Math.PI * 2);
                ctx.fillStyle = petalColor;
                ctx.fill();
                ctx.restore();
            }
            
            // Draw center petals
            ctx.globalAlpha = config.opacity.centerPetal * layerOpacity;
            circles.forEach(circle => {
                const centerPetalColor = getColorFromClass(`sol-center-petal-${circle.index}`) || '#EEEEEE';
                
                ctx.save();
                ctx.beginPath();
                ctx.arc(circle.x, circle.y, baseRadius, 0, Math.PI * 2);
                ctx.clip();
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
                ctx.fillStyle = centerPetalColor;
                ctx.fill();
                ctx.restore();
            });
            
            // Draw center circle
            ctx.globalAlpha = config.opacity.center * layerOpacity;
            ctx.beginPath();
            ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
            ctx.fillStyle = getColorFromClass('sol-circle-center') || '#FFFFFF';
            ctx.fill();
            
            // Draw borders - make them more visible on background layer
            ctx.globalAlpha = isBackgroundLayer ? (layerOpacity * 0.5) : layerOpacity;
            const borderElement = document.createElement('div');
            borderElement.className = 'sol-border';
            borderElement.style.display = 'none';
            document.body.appendChild(borderElement);
            const borderStyles = window.getComputedStyle(borderElement);
            ctx.strokeStyle = borderStyles.stroke || '#FFFFFF';
            ctx.lineWidth = parseInt(borderStyles.strokeWidth) || 3;
            document.body.removeChild(borderElement);
            
            // Make background borders thinner
            if (isBackgroundLayer) {
                ctx.lineWidth = ctx.lineWidth * 0.5;
            }
            
            circles.forEach(circle => {
                ctx.beginPath();
                ctx.arc(circle.x, circle.y, baseRadius, 0, Math.PI * 2);
                ctx.stroke();
            });
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Draw center symbols only on foreground layer
            if (!isBackgroundLayer || !isAnimating) {
                ctx.globalAlpha = layerOpacity;
                drawYinYang(centerX, centerY, baseRadius * 0.3);
                drawAleph(centerX, centerY, baseRadius * 0.2);
            }
            
            // Restore context state
            ctx.restore();
            
            if (!isBackgroundLayer) {
                log(`Draw #${state.drawCount} complete (layered: ${isAnimating && config.layerEffect.enabled})`, 'success');
            }
        }
        
        /**
         * Draw Yin-Yang
         */
        function drawYinYang(x, y, radius) {
            ctx.save();
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(x, y, radius, Math.PI/2, -Math.PI/2);
            ctx.lineTo(x, y - radius);
            ctx.fillStyle = '#000000';
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(x, y - radius/2, radius/2, 0, Math.PI * 2);
            ctx.fillStyle = '#000000';
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(x, y + radius/2, radius/2, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(x, y - radius/2, radius/6, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(x, y + radius/2, radius/6, 0, Math.PI * 2);
            ctx.fillStyle = '#000000';
            ctx.fill();
            
            ctx.restore();
        }
        
        /**
         * Draw Aleph
         */
        function drawAleph(x, y, size) {
            ctx.save();
            ctx.fillStyle = '#000000';
            ctx.font = `bold ${size}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('א', x, y + 2);
            ctx.restore();
        }
        
        /**
         * Animation loop with layered effect
         */
        function animate() {
            if (isAnimating) {
                state.animationFrameCount++;
                
                // Log every second (60 frames)
                if (state.animationFrameCount % 60 === 0) {
                    log(`Animation frame ${state.animationFrameCount}, layerEffect: ${config.layerEffect.enabled}`, 'debug');
                    console.log('%c🌺 LAYERING ACTIVE: Background static, Foreground rotating', 'color: #4CAF50; font-weight: bold');
                }
                
                // Clear canvas completely
                const bgColor = getColorFromClass('sol-background') || '#FFFFFF';
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Always draw static background layer when animating
                if (config.layerEffect.enabled) {
                    // Draw static ghost image in background
                    draw(0, true); // No rotation, is background layer
                    
                    // Log first time to confirm it's working
                    if (state.animationFrameCount === 1) {
                        console.log('%c✨ Layer Effect ON: Static background at 20% opacity', 'color: #FF9800; font-weight: bold');
                        console.log('%c✨ Layer Effect ON: Rotating foreground at 90% opacity', 'color: #2196F3; font-weight: bold');
                    }
                }
                
                // Draw rotating foreground layer
                animationFrame += 0.005;
                draw(animationFrame, false); // With rotation, not background
                
                animationId = requestAnimationFrame(animate);
            }
        }
        
        /**
         * Toggle animation
         */
        function toggleAnimation() {
            log(`Toggle animation: ${!isAnimating}`, 'info');
            isAnimating = !isAnimating;
            
            if (isAnimating) {
                state.animationFrameCount = 0;
                animate();
            } else if (animationId) {
                cancelAnimationFrame(animationId);
            }
        }
        
        /**
         * Reset
         */
        function reset() {
            log('Reset', 'info');
            isAnimating = false;
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            animationFrame = 0;
            state.animationFrameCount = 0;
            draw();
        }
        
        /**
         * Attach events
         */
        function attachEventListeners() {
            let isDragging = false;
            let lastMouseX = 0;
            
            canvas.addEventListener('mousedown', (e) => {
                if (!isAnimating) {
                    isDragging = true;
                    lastMouseX = e.clientX;
                    log(`Mouse down at ${e.clientX}`, 'debug');
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
            });
            
            canvas.addEventListener('mouseleave', () => {
                isDragging = false;
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
            
            log('Event listeners attached', 'success');
        }
        
        /**
         * Set layer effect configuration
         */
        function setLayerEffect(enabled, bgOpacity, fgOpacity) {
            config.layerEffect.enabled = enabled;
            if (bgOpacity !== undefined) {
                config.layerEffect.backgroundOpacity = parseFloat(bgOpacity);
            }
            if (fgOpacity !== undefined) {
                config.layerEffect.foregroundOpacity = parseFloat(fgOpacity);
            }
            log(`Layer effect updated: enabled=${enabled}, bg=${config.layerEffect.backgroundOpacity}, fg=${config.layerEffect.foregroundOpacity}`, 'info');
            
            // Redraw if not animating
            if (!isAnimating) {
                draw(animationFrame);
            }
        }
        
        // Public API
        const api = {
            init: init,
            toggleAnimation: toggleAnimation,
            reset: reset,
            draw: draw,
            setLayerEffect: setLayerEffect,
            getState: () => state,
            getConfig: () => config
        };
        
        // Auto-initialize
        const instance = init();
        if (instance) {
            globalState.instances[canvasId] = instance;
            globalState.instanceCount++;
            log(`Instance registered: ${canvasId} (Total: ${globalState.instanceCount})`, 'success');
        }
        
        return api;
    }
    
    // Make it globally available
    window.initSeedOfLife = initSeedOfLife;
    window.seedOfLifeDebug = globalState;
    
    console.log('[SeedOfLife] Plugin ready. Use initSeedOfLife(canvasId) to create instances.');
    console.log('[SeedOfLife] Debug info available at window.seedOfLifeDebug');
    
})();