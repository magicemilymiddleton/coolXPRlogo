<?php
/**
 * Plugin Name: Seed of Life Sacred Geometry
 * Plugin URI: https://yoursite.com/
 * Description: Display customizable Seed of Life sacred geometry patterns with animation
 * Version: 2.0.0
 * Author: Your Name
 * License: GPL v2 or later
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class SeedOfLifePlugin {
    
    private $options;
    private $default_colors;
    
    public function __construct() {
        $this->default_colors = array(
            // Primary circles - matching your image exactly
            'circle_1' => '#000000', // Top (Black)
            'circle_2' => '#00FF00', // Top-Right (Bright Green)
            'circle_3' => '#FF0000', // Right (Red)
            'circle_4' => '#8B4513', // Bottom-Right (Brown)
            'circle_5' => '#0000FF', // Bottom-Left (Blue)
            'circle_6' => '#00CED1', // Left (Cyan/Turquoise)
            'circle_center' => 'transparent', // Center (transparent to show inner segments)
            
            // Petal intersections (where two adjacent circles overlap)
            'petal_1_2' => '#90EE90', // Black + Green = Light green
            'petal_2_3' => '#FFA500', // Green + Red = Orange
            'petal_3_4' => '#FF6B6B', // Red + Brown = Reddish
            'petal_4_5' => '#4B0082', // Brown + Blue = Indigo
            'petal_5_6' => '#87CEEB', // Blue + Cyan = Sky blue
            'petal_6_1' => '#008B8B', // Cyan + Black = Dark cyan
            
            // Center petals (where each outer circle meets the center)
            'center_petal_1' => '#FFD700', // Center + Black = Gold/Yellow
            'center_petal_2' => '#ADFF2F', // Center + Green = Yellow-green
            'center_petal_3' => '#FF1493', // Center + Red = Magenta/Pink
            'center_petal_4' => '#D2691E', // Center + Brown = Chocolate
            'center_petal_5' => '#9370DB', // Center + Blue = Purple
            'center_petal_6' => '#E0FFFF', // Center + Cyan = Light cyan
            
            // Inner center segments (the 6 pie slices in the very center)
            // These are visible when circle_center is transparent
            'inner_sliver_1' => '#FFFF00',  // Yellow (top)
            'inner_sliver_2' => '#FFA500',  // Orange (top-right)
            'inner_sliver_3' => '#FF1493',  // Pink/Magenta (right)
            'inner_sliver_4' => '#800080',  // Purple (bottom-right)
            'inner_sliver_5' => '#E6E6FA',  // Lavender (bottom-left)
            'inner_sliver_6' => '#FFB6C1',  // Light Pink (left)
            
            // Additional color options for customization
            'inner_sliver_7' => '#00FFFF',  // Cyan (alternative)
            'inner_sliver_8' => '#98FB98',  // Pale Green (alternative)
            'inner_sliver_9' => '#DDA0DD',  // Plum (alternative)
            'inner_sliver_10' => '#F0E68C', // Khaki (alternative)
            'inner_sliver_11' => '#FA8072', // Salmon (alternative)
            'inner_sliver_12' => '#ADD8E6', // Light Blue (alternative)
            
            // UI elements
            'border_color' => '#FFFFFF',
            'border_width' => '3',
            'background' => '#FFFFFF'
        );
        
        add_action('init', array($this, 'init'));
    }
    
    public function init() {
        // Register shortcode
        add_shortcode('seed_of_life', array($this, 'render_shortcode'));
        
        // Enqueue scripts and styles
        add_action('wp_enqueue_scripts', array($this, 'enqueue_assets'));
        
        // Add admin menu
        add_action('admin_menu', array($this, 'add_admin_menu'));
        
        // Register settings
        add_action('admin_init', array($this, 'register_settings'));
        
        // Load options
        $this->options = get_option('seed_of_life_colors', $this->default_colors);
    }
    
    /**
     * Enqueue plugin assets
     */
    public function enqueue_assets() {
        // Debug: Log when this function is called
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('[SeedOfLife] Enqueue assets function called');
        }
        
        // Only load on pages that use the shortcode
        global $post;
        if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'seed_of_life')) {
            
            // Debug: Log that shortcode was found
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('[SeedOfLife] Shortcode found, loading assets');
            }
            
            // Base styles FIRST
            wp_enqueue_style(
                'seed-of-life-base',
                plugin_dir_url(__FILE__) . 'assets/seed-of-life.css',
                array(),
                '2.0.0'
            );
            
            // Add dynamic CSS inline AFTER base styles
            wp_add_inline_style('seed-of-life-base', $this->generate_dynamic_css());
            
            // Enqueue JavaScript
            wp_enqueue_script(
                'seed-of-life-js',
                plugin_dir_url(__FILE__) . 'assets/seed-of-life.js',
                array(),
                '2.0.0',
                true
            );
            
            // Add debug info to JavaScript
            wp_localize_script('seed-of-life-js', 'seedOfLifeConfig', array(
                'debug' => defined('WP_DEBUG') && WP_DEBUG,
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'pluginUrl' => plugin_dir_url(__FILE__),
                'version' => '2.0.0'
            ));
        }
    }
    
    /**
     * Generate dynamic CSS from saved options
     */
    private function generate_dynamic_css() {
        $css = '';
        
        // Primary circles
        for ($i = 1; $i <= 6; $i++) {
            $color = isset($this->options["circle_$i"]) ? $this->options["circle_$i"] : $this->default_colors["circle_$i"];
            $css .= ".sol-circle-$i { fill: $color; background-color: $color; }\n";
        }
        
        // Center circle
        $center_color = isset($this->options['circle_center']) ? $this->options['circle_center'] : $this->default_colors['circle_center'];
        $css .= ".sol-circle-center { fill: $center_color; background-color: $center_color; }\n";
        
        // Petal intersections
        for ($i = 1; $i <= 6; $i++) {
            $j = ($i % 6) + 1;
            $color = isset($this->options["petal_{$i}_{$j}"]) ? $this->options["petal_{$i}_{$j}"] : $this->default_colors["petal_{$i}_{$j}"];
            $css .= ".sol-petal-{$i}-{$j} { fill: $color; background-color: $color; }\n";
        }
        
        // Center petals
        for ($i = 1; $i <= 6; $i++) {
            $color = isset($this->options["center_petal_$i"]) ? $this->options["center_petal_$i"] : $this->default_colors["center_petal_$i"];
            $css .= ".sol-center-petal-$i { fill: $color; background-color: $color; }\n";
        }
        
        // Inner slivers - IMPORTANT: These need to be properly generated
        for ($i = 1; $i <= 12; $i++) {
            $color = isset($this->options["inner_sliver_$i"]) ? $this->options["inner_sliver_$i"] : 
                     (isset($this->default_colors["inner_sliver_$i"]) ? $this->default_colors["inner_sliver_$i"] : '#FFFFFF');
            $css .= ".sol-inner-sliver-$i { fill: $color; background-color: $color; }\n";
        }
        
        // Border and background
        $border_color = isset($this->options['border_color']) ? $this->options['border_color'] : $this->default_colors['border_color'];
        $border_width = isset($this->options['border_width']) ? $this->options['border_width'] : $this->default_colors['border_width'];
        $background = isset($this->options['background']) ? $this->options['background'] : $this->default_colors['background'];
        
        $css .= ".sol-border { stroke: $border_color; stroke-width: {$border_width}px; }\n";
        $css .= ".sol-background { fill: $background; background-color: $background; }\n";
        
        // Debug: Log the CSS being generated
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('[SeedOfLife] Generated CSS includes ' . substr_count($css, 'sol-inner-sliver') . ' inner sliver classes');
        }
        
        return $css;
    }
    
    /**
     * Render shortcode
     */
    public function render_shortcode($atts) {
        $atts = shortcode_atts(array(
            'width' => 500,
            'height' => 500,
            'animation' => 'true',
            'layer_effect' => 'true',
            'background_opacity' => '0.25',
            'foreground_opacity' => '1.0',
            'id' => uniqid('sol_')
        ), $atts);
        
        ob_start();
        ?>
        <div class="seed-of-life-container" data-sol-id="<?php echo esc_attr($atts['id']); ?>">
            <canvas class="seed-of-life-canvas" 
                    id="seedOfLife_<?php echo esc_attr($atts['id']); ?>" 
                    width="<?php echo esc_attr($atts['width']); ?>" 
                    height="<?php echo esc_attr($atts['height']); ?>">
            </canvas>
            <?php if ($atts['animation'] === 'true'): ?>
            <div class="seed-of-life-controls">
                <button class="sol-button" onclick="seedOfLife_<?php echo esc_js($atts['id']); ?>.toggleAnimation()">
                    Toggle Animation
                </button>
                <button class="sol-button" onclick="seedOfLife_<?php echo esc_js($atts['id']); ?>.reset()">
                    Reset
                </button>
            </div>
            <?php endif; ?>
        </div>
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                if (typeof initSeedOfLife === 'function') {
                    window.seedOfLife_<?php echo esc_js($atts['id']); ?> = initSeedOfLife('seedOfLife_<?php echo esc_js($atts['id']); ?>');
                    <?php if ($atts['layer_effect'] === 'true'): ?>
                    // Configure layer effect
                    if (window.seedOfLife_<?php echo esc_js($atts['id']); ?>.setLayerEffect) {
                        window.seedOfLife_<?php echo esc_js($atts['id']); ?>.setLayerEffect(
                            true, 
                            <?php echo esc_js($atts['background_opacity']); ?>,
                            <?php echo esc_js($atts['foreground_opacity']); ?>
                        );
                    }
                    <?php endif; ?>
                }
            });
        </script>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_menu_page(
            'Seed of Life Settings',
            'Seed of Life',
            'manage_options',
            'seed-of-life',
            array($this, 'admin_page'),
            'dashicons-star-filled',
            30
        );
    }
    
    /**
     * Admin settings page
     */
    public function admin_page() {
        ?>
        <div class="wrap">
            <h1>Seed of Life Settings</h1>
            
            <form method="post" action="options.php">
                <?php settings_fields('seed_of_life_settings'); ?>
                
                <h2>Color Settings</h2>
                <p>Customize the colors for each area of the Seed of Life pattern. Every area is individually colorable!</p>
                
                <table class="form-table">
                    <tr>
                        <th colspan="2"><h3>Primary Circles (6 Main Circles)</h3></th>
                    </tr>
                    <?php
                    $circle_labels = array(
                        1 => 'Top (Black)',
                        2 => 'Top-Right (Green)',
                        3 => 'Right (Red)',
                        4 => 'Bottom-Right (Brown)',
                        5 => 'Bottom-Left (Blue)',
                        6 => 'Left (Cyan)'
                    );
                    
                    foreach ($circle_labels as $i => $label):
                        $value = isset($this->options["circle_$i"]) ? $this->options["circle_$i"] : $this->default_colors["circle_$i"];
                    ?>
                    <tr>
                        <th scope="row">Circle <?php echo $i; ?> - <?php echo $label; ?></th>
                        <td>
                            <span class="color-preview" style="background-color: <?php echo esc_attr($value); ?>"></span>
                            <input type="text" 
                                   name="seed_of_life_colors[circle_<?php echo $i; ?>]" 
                                   value="<?php echo esc_attr($value); ?>" 
                                   class="color-field" />
                        </td>
                    </tr>
                    <?php endforeach; ?>
                    
                    <tr>
                        <th scope="row">Center Circle (White)</th>
                        <td>
                            <span class="color-preview" style="background-color: <?php echo esc_attr($this->options['circle_center']); ?>"></span>
                            <input type="text" 
                                   name="seed_of_life_colors[circle_center]" 
                                   value="<?php echo esc_attr($this->options['circle_center']); ?>" 
                                   class="color-field" />
                        </td>
                    </tr>
                    
                    <tr>
                        <th colspan="2"><h3>Petal Intersections (Where Circles Overlap)</h3></th>
                    </tr>
                    <?php
                    $petal_labels = array(
                        '1_2' => 'Black + Green',
                        '2_3' => 'Green + Red (Orange)',
                        '3_4' => 'Red + Brown',
                        '4_5' => 'Brown + Blue (Indigo)',
                        '5_6' => 'Blue + Cyan',
                        '6_1' => 'Cyan + Black'
                    );
                    
                    foreach ($petal_labels as $key => $label):
                        $value = isset($this->options["petal_$key"]) ? $this->options["petal_$key"] : $this->default_colors["petal_$key"];
                    ?>
                    <tr>
                        <th scope="row"><?php echo $label; ?></th>
                        <td>
                            <span class="color-preview" style="background-color: <?php echo esc_attr($value); ?>"></span>
                            <input type="text" 
                                   name="seed_of_life_colors[petal_<?php echo $key; ?>]" 
                                   value="<?php echo esc_attr($value); ?>" 
                                   class="color-field" />
                        </td>
                    </tr>
                    <?php endforeach; ?>
                    
                    <tr>
                        <th colspan="2"><h3>Center Petals (Center Meeting Each Circle)</h3></th>
                    </tr>
                    <?php
                    $center_petal_labels = array(
                        1 => 'Center + Black (Yellow)',
                        2 => 'Center + Green',
                        3 => 'Center + Red (Magenta)',
                        4 => 'Center + Brown',
                        5 => 'Center + Blue (Purple)',
                        6 => 'Center + Cyan'
                    );
                    
                    foreach ($center_petal_labels as $i => $label):
                        $value = isset($this->options["center_petal_$i"]) ? $this->options["center_petal_$i"] : $this->default_colors["center_petal_$i"];
                    ?>
                    <tr>
                        <th scope="row"><?php echo $label; ?></th>
                        <td>
                            <span class="color-preview" style="background-color: <?php echo esc_attr($value); ?>"></span>
                            <input type="text" 
                                   name="seed_of_life_colors[center_petal_<?php echo $i; ?>]" 
                                   value="<?php echo esc_attr($value); ?>" 
                                   class="color-field" />
                        </td>
                    </tr>
                    <?php endforeach; ?>
                    
                    <tr>
                        <th colspan="2"><h3>Inner Color Slivers (Small Intersection Areas)</h3></th>
                    </tr>
                    <?php
                    $sliver_labels = array(
                        1 => 'Yellow',
                        2 => 'Magenta',
                        3 => 'Cyan',
                        4 => 'Orange',
                        5 => 'Purple',
                        6 => 'White',
                        7 => 'Light Pink',
                        8 => 'Pale Green',
                        9 => 'Plum',
                        10 => 'Khaki',
                        11 => 'Salmon',
                        12 => 'Light Blue'
                    );
                    
                    foreach ($sliver_labels as $i => $label):
                        $value = isset($this->options["inner_sliver_$i"]) ? $this->options["inner_sliver_$i"] : (isset($this->default_colors["inner_sliver_$i"]) ? $this->default_colors["inner_sliver_$i"] : '#FFFFFF');
                    ?>
                    <tr>
                        <th scope="row">Inner Sliver <?php echo $i; ?> - <?php echo $label; ?></th>
                        <td>
                            <span class="color-preview" style="background-color: <?php echo esc_attr($value); ?>"></span>
                            <input type="text" 
                                   name="seed_of_life_colors[inner_sliver_<?php echo $i; ?>]" 
                                   value="<?php echo esc_attr($value); ?>" 
                                   class="color-field" />
                        </td>
                    </tr>
                    <?php endforeach; ?>
                    
                    <tr>
                        <th colspan="2"><h3>Border & Background</h3></th>
                    </tr>
                    <tr>
                        <th scope="row">Border Color</th>
                        <td>
                            <input type="text" 
                                   name="seed_of_life_colors[border_color]" 
                                   value="<?php echo esc_attr($this->options['border_color']); ?>" 
                                   class="color-field" />
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Border Width (px)</th>
                        <td>
                            <input type="number" 
                                   name="seed_of_life_colors[border_width]" 
                                   value="<?php echo esc_attr($this->options['border_width']); ?>" 
                                   min="1" max="10" />
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Background Color</th>
                        <td>
                            <input type="text" 
                                   name="seed_of_life_colors[background]" 
                                   value="<?php echo esc_attr($this->options['background']); ?>" 
                                   class="color-field" />
                        </td>
                    </tr>
                </table>
                
                <?php submit_button(); ?>
            </form>
            
            <div class="seed-of-life-preview">
                <h2>Live Preview</h2>
                <?php echo do_shortcode('[seed_of_life width="400" height="400"]'); ?>
            </div>
            
            <div class="seed-of-life-usage">
                <h2>Usage</h2>
                <p>Use the shortcode <code>[seed_of_life]</code> to display the pattern in your posts or pages.</p>
                <p>Optional parameters:</p>
                <ul>
                    <li><code>width="500"</code> - Canvas width in pixels</li>
                    <li><code>height="500"</code> - Canvas height in pixels</li>
                    <li><code>animation="true"</code> - Show animation controls (true/false)</li>
                    <li><code>layer_effect="true"</code> - Enable layered animation effect</li>
                </ul>
                <p>Example: <code>[seed_of_life width="600" height="600" animation="true"]</code></p>
                <p><strong>NEW:</strong> Every single area is now individually colorable through the settings!</p>
            </div>
        </div>
        
        <script>
            jQuery(document).ready(function($) {
                $('.color-field').wpColorPicker();
            });
        </script>
        <?php
    }
    
    /**
     * Register plugin settings
     */
    public function register_settings() {
        register_setting('seed_of_life_settings', 'seed_of_life_colors');
    }
}

// Initialize plugin
new SeedOfLifePlugin();
