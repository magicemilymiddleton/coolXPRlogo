/**
 * Seed of Life WordPress Plugin JavaScript
 * Version: 2.0.0
 * Enhanced with full color customization for all areas
 */

(function() {
    'use strict';
    
    console.log('[SeedOfLife] JavaScript file loaded - Version 2.0');
    
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
        
        // Configuration - matching your image
        const config = {
            radiusRatio: 0.16,
            opacity: {
                primary: 0.85,        // Main circles more opaque
                intersection: 0.9,     // Overlaps vibrant
                centerPetal: 0.85,     // Center petals visible
                center: 0.9,          // Center circle
                innerSliver: 0.95     // Inner slivers bright
            },
            layerEffect: {
                enabled: true,
                backgroundOpacity: 0.25,  // Ghost image in background
                foregroundOpacity: 1.0     // Full opacity foreground
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
         * Get color from CSS class with fallback colors
         */
        function getColorFromClass(className) {
            log(`Retrieving color for class: ${className}`, 'debug');
            
            if (state.colorCache[className]) {
                log(`Color found in cache: ${className} = ${state.colorCache[className]}`, 'debug');
                return state.colorCache[className];
            }
            
            // Define fallback colors matching your image exactly
            const fallbackColors = {
                'sol-circle-1': '#000000',     // Black
                'sol-circle-2': '#00FF00',     // Bright Green
                'sol-circle-3': '#FF0000',     // Red
                'sol-circle-4': '#8B4513',     // Brown
                'sol-circle-5': '#0000FF',     // Blue
                'sol-circle-6': '#00CED1',     // Cyan
                'sol-circle-center': 'transparent', // White
                
                'sol-petal-1-2': '#90EE90',    // Light green
                'sol-petal-2-3': '#FFA500',    // Orange
                'sol-petal-3-4': '#FF6B6B',    // Light red
                'sol-petal-4-5': '#4B0082',    // Indigo
                'sol-petal-5-6': '#87CEEB',    // Sky blue
                'sol-petal-6-1': '#008B8B',    // Dark cyan
                
                'sol-center-petal-1': '#FFD700', // Gold
                'sol-center-petal-2': '#ADFF2F', // Yellow-green
                'sol-center-petal-3': '#FF1493', // Deep pink
                'sol-center-petal-4': '#D2691E', // Chocolate
                'sol-center-petal-5': '#9370DB', // Purple
                'sol-center-petal-6': '#E0FFFF', // Light cyan
                
                // Inner slivers
                'sol-inner-sliver-1': '#FFFF00',  // Yellow
                'sol-inner-sliver-2': '#FF00FF',  // Magenta
                'sol-inner-sliver-3': '#00FFFF',  // Cyan
                'sol-inner-sliver-4': '#FFA500',  // Orange
                'sol-inner-sliver-5': '#800080',  // Purple
                'sol-inner-sliver-6': '#FFFFFF',  // White
                'sol-inner-sliver-7': '#FFB6C1',  // Light Pink
                'sol-inner-sliver-8': '#98FB98',  // Pale Green
                'sol-inner-sliver-9': '#DDA0DD',  // Plum
                'sol-inner-sliver-10': '#F0E68C', // Khaki
                'sol-inner-sliver-11': '#FA8072', // Salmon
                'sol-inner-sliver-12': '#ADD8E6', // Light Blue
                
                'sol-border': '#FFFFFF',
                'sol-background': '#FFFFFF'
            };
            
            try {
                const element = document.createElement('div');
                element.className = className;
                element.style.display = 'none';
                document.body.appendChild(element);
                const styles = window.getComputedStyle(element);
                let color = styles.fill || styles.backgroundColor || fallbackColors[className] || '#000000';
                document.body.removeChild(element);
                
                // Use fallback if color is transparent or default
                if (color === 'rgba(0, 0, 0, 0)' || color === 'transparent' || (color === '#000000' && className !== 'sol-circle-1')) {
                    color = fallbackColors[className] || '#808080';
                    log(`Using fallback color for ${className}: ${color}`, 'info');
                }
                
                state.colorCache[className] = color;
                
                log(`Color retrieved: ${className} = ${color}`, 'success');
                
                return color;
            } catch (error) {
                log(`Error retrieving color for ${className}: ${error.message}`, 'error', error);
                return fallbackColors[className] || '#808080';
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
            
            attachEventListeners();
            draw();
            
            state.initialized = true;
            log('Initialization complete', 'success', state);
            
            return api; // Return the API
        }
        
        /**
         * Enhanced draw function with all color areas
         */
        function draw(rotation = 0, isBackgroundLayer = false) {
            if (!isBackgroundLayer) {
                state.drawCount++;
                state.lastAction = 'draw';
                log(`Draw #${state.drawCount} with rotation: ${rotation.toFixed(3)}`, 'debug');
            }
            
            // Clear canvas for the first layer
            if (!isBackgroundLayer && !isAnimating) {
                const bgColor = getColorFromClass('sol-background');
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            
            // Save context state
            ctx.save();
            
            // Set layer opacity
            let layerOpacity = 1.0;
            if (isAnimating && config.layerEffect.enabled) {
                layerOpacity = isBackgroundLayer ? config.layerEffect.backgroundOpacity : config.layerEffect.foregroundOpacity;
                
                // Add scale effect for background
                if (isBackgroundLayer) {
                    ctx.translate(centerX, centerY);
                    ctx.scale(0.95, 0.95);
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
                    color: getColorFromClass(`sol-circle-${i + 1}`)
                });
            }
            
            // Draw primary circles first (bottom layer)
            ctx.globalAlpha = config.opacity.primary * layerOpacity;
            circles.forEach(circle => {
                ctx.beginPath();
                ctx.arc(circle.x, circle.y, baseRadius, 0, Math.PI * 2);
                ctx.fillStyle = circle.color;
                ctx.fill();
            });
            
            // Draw petal intersections (where two circles overlap)
            ctx.globalAlpha = config.opacity.intersection * layerOpacity;
            for (let i = 0; i < circles.length; i++) {
                const circle1 = circles[i];
                const circle2 = circles[(i + 1) % circles.length];
                const petalColor = getColorFromClass(`sol-petal-${circle1.index}-${circle2.index}`);
                
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
            
            // Draw center petals (where each outer circle meets center)
            ctx.globalAlpha = config.opacity.centerPetal * layerOpacity;
            circles.forEach(circle => {
                const centerPetalColor = getColorFromClass(`sol-center-petal-${circle.index}`);
                
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
            
            // Draw the 6 inner colored segments BEFORE center circle
            drawInnerSlivers(circles, layerOpacity);
            
            // Draw center circle (may be transparent) - this goes on TOP of the segments
            const centerColor = getColorFromClass('sol-circle-center');
            if (centerColor && centerColor !== 'transparent' && centerColor !== 'rgba(0, 0, 0, 0)') {
                ctx.globalAlpha = config.opacity.center * layerOpacity;
                ctx.beginPath();
                ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
                ctx.fillStyle = centerColor;
                ctx.fill();
            }
            
            // Draw borders
            drawBorders(circles, layerOpacity, isBackgroundLayer);
            
            // Draw center symbols (yin-yang and aleph)
            if (!isBackgroundLayer || !isAnimating) {
                ctx.globalAlpha = layerOpacity;
                drawYinYang(centerX, centerY, baseRadius * 0.3);
                drawAleph(centerX, centerY, baseRadius * 0.2);
            }
            
            // Restore context
            ctx.restore();
            
            if (!isBackgroundLayer) {
                log(`Draw #${state.drawCount} complete`, 'success');
            }
        }
        
        /**
         * Draw the inner colorful slivers - the 6 segments in the very center
         */
        function drawInnerSlivers(circles, layerOpacity) {
            // These are the 6 colored segments in the innermost circle
            // where all the petals meet at the center
            
            ctx.globalAlpha = config.opacity.innerSliver * layerOpacity;
            
            // Define the 6 center segment colors (matching your image)
            const centerSegmentColors = [
                getColorFromClass('sol-inner-sliver-1') || '#FFFF00',  // Yellow (top)
                getColorFromClass('sol-inner-sliver-2') || '#FFA500',  // Orange (top-right)
                getColorFromClass('sol-inner-sliver-3') || '#FF1493',  // Pink/Magenta (right)
                getColorFromClass('sol-inner-sliver-4') || '#800080',  // Purple (bottom-right)
                getColorFromClass('sol-inner-sliver-5') || '#E6E6FA',  // Light purple/lavender (bottom-left)
                getColorFromClass('sol-inner-sliver-6') || '#FFB6C1'   // Light pink (left)
            ];
            
            // Draw the 6 pie-shaped segments in the very center
            const centerSegmentRadius = baseRadius * 0.5; // Radius of the center area with segments
            
            for (let i = 0; i < 6; i++) {
                ctx.save();
                
                // Calculate angles for this segment (60 degrees each)
                const startAngle = (i * Math.PI / 3) - Math.PI / 2 - Math.PI / 6; // Offset to align with petals
                const endAngle = startAngle + Math.PI / 3;
                
                // Draw the pie segment
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, centerSegmentRadius, startAngle, endAngle);
                ctx.closePath();
                
                ctx.fillStyle = centerSegmentColors[i];
                ctx.fill();
                
                ctx.restore();
                
                log(`Drew center segment ${i + 1}: ${centerSegmentColors[i]}`, 'debug');
            }
            
            // Optional: Add a subtle border between segments
            ctx.save();
            ctx.globalAlpha = 0.3 * layerOpacity;
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1;
            
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI / 3) - Math.PI / 2 - Math.PI / 6;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                const x = centerX + Math.cos(angle) * centerSegmentRadius;
                const y = centerY + Math.sin(angle) * centerSegmentRadius;
                ctx.lineTo(x, y);
                ctx.stroke();
            }
            
            // Draw the outer circle of the center segments
            ctx.beginPath();
            ctx.arc(centerX, centerY, centerSegmentRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
            
            // Log completion
            log(`Drew 6 inner center segments with colors`, 'success');
        }
        
        /**
         * Draw borders
         */
        function drawBorders(circles, layerOpacity, isBackgroundLayer) {
            ctx.globalAlpha = isBackgroundLayer ? (layerOpacity * 0.5) : layerOpacity;
            
            const borderElement = document.createElement('div');
            borderElement.className = 'sol-border';
            borderElement.style.display = 'none';
            document.body.appendChild(borderElement);
            const borderStyles = window.getComputedStyle(borderElement);
            ctx.strokeStyle = borderStyles.stroke || '#FFFFFF';
            ctx.lineWidth = parseInt(borderStyles.strokeWidth) || 3;
            document.body.removeChild(borderElement);
            
            if (isBackgroundLayer) {
                ctx.lineWidth = ctx.lineWidth * 0.5;
            }
            
            // Draw circle borders
            circles.forEach(circle => {
                ctx.beginPath();
                ctx.arc(circle.x, circle.y, baseRadius, 0, Math.PI * 2);
                ctx.stroke();
            });
            
            // Draw center circle border
            ctx.beginPath();
            ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        /**
         * Draw Yin-Yang symbol
         */
        function drawYinYang(x, y, radius) {
            ctx.save();
            
            // White background
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Black half
            ctx.beginPath();
            ctx.arc(x, y, radius, Math.PI/2, -Math.PI/2);
            ctx.lineTo(x, y - radius);
            ctx.fillStyle = '#000000';
            ctx.fill();
            
            // Black small circle
            ctx.beginPath();
            ctx.arc(x, y - radius/2, radius/2, 0, Math.PI * 2);
            ctx.fillStyle = '#000000';
            ctx.fill();
            
            // White small circle
            ctx.beginPath();
            ctx.arc(x, y + radius/2, radius/2, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            
            // White dot in black
            ctx.beginPath();
            ctx.arc(x, y - radius/2, radius/6, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            
            // Black dot in white
            ctx.beginPath();
            ctx.arc(x, y + radius/2, radius/6, 0, Math.PI * 2);
            ctx.fillStyle = '#000000';
            ctx.fill();
            
            ctx.restore();
        }
        
        /**
         * Draw Aleph symbol
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
         * Animation loop with enhanced layered effect
         */
        function animate() {
            if (isAnimating) {
                state.animationFrameCount++;
                
                // Log animation status periodically
                if (state.animationFrameCount % 60 === 0) {
                    log(`Animation frame ${state.animationFrameCount}`, 'debug');
                }
                
                // Clear and redraw
                const bgColor = getColorFromClass('sol-background');
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw static background layer
                if (config.layerEffect.enabled) {
                    draw(0, true); // Static background
                }
                
                // Draw rotating foreground
                animationFrame += 0.005;
                draw(animationFrame, false);
                
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
                console.log('%c🌺 Animation Started! Watch the sacred geometry come alive!', 'color: #FF1493; font-size: 14px; font-weight: bold');
                animate();
            } else if (animationId) {
                cancelAnimationFrame(animationId);
                console.log('%c⏸ Animation Paused', 'color: #4169E1; font-size: 14px; font-weight: bold');
            }
        }
        
        /**
         * Reset to initial state
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
            console.log('%c🔄 Reset to original position', 'color: #00CED1; font-size: 14px; font-weight: bold');
        }
        
        /**
         * Attach event listeners for interaction
         */
        function attachEventListeners() {
            let isDragging = false;
            let lastMouseX = 0;
            
            // Mouse events
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
                canvas.style.cursor = 'grab';
            });
            
            canvas.addEventListener('mouseleave', () => {
                isDragging = false;
                canvas.style.cursor = 'grab';
            });
            
            // Touch events for mobile
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
            
            // Set initial cursor
            canvas.style.cursor = 'grab';
            
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
            log(`Layer effect updated: enabled=${enabled}`, 'info');
            
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
            console.log('%c✨ Seed of Life initialized successfully!', 'color: #00FF00; font-size: 16px; font-weight: bold');
        }
        
        return api;
    }
    
    // Make it globally available
    window.initSeedOfLife = initSeedOfLife;
    window.seedOfLifeDebug = globalState;
    
    console.log('[SeedOfLife] Plugin ready. Use initSeedOfLife(canvasId) to create instances.');
    console.log('[SeedOfLife] Debug info available at window.seedOfLifeDebug');
    console.log('%c🌸 Seed of Life v2.0 - Every area is now colorable!', 'color: #FF1493; font-size: 14px; font-weight: bold');
    
})();
