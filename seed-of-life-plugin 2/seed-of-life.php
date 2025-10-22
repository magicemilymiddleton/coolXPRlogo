<?php
/**
 * Plugin Name: Seed of Life Sacred Geometry
 * Plugin URI: https://yoursite.com/
 * Description: Display customizable Seed of Life sacred geometry patterns with animation
 * Version: 1.0.0
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
            // Primary circles (1-6 clockwise from top)
            'circle_1' => '#00CED1', // Top
            'circle_2' => '#32CD32', // Top-Right
            'circle_3' => '#DC143C', // Bottom-Right  
            'circle_4' => '#FF8C00', // Bottom
            'circle_5' => '#8B4513', // Bottom-Left
            'circle_6' => '#4169E1', // Top-Left
            'circle_center' => '#FFFFFF', // Center
            
            // Petal intersections (between adjacent circles)
            'petal_1_2' => '#16E6A1', // Top + Top-Right
            'petal_2_3' => '#A6B034', // Top-Right + Bottom-Right
            'petal_3_4' => '#EE5A24', // Bottom-Right + Bottom
            'petal_4_5' => '#C44000', // Bottom + Bottom-Left
            'petal_5_6' => '#6A3C9E', // Bottom-Left + Top-Left
            'petal_6_1' => '#2095C9', // Top-Left + Top
            
            // Center petals (where outer circles meet center)
            'center_petal_1' => '#B0F4F5', // Center + Top
            'center_petal_2' => '#98FB98', // Center + Top-Right
            'center_petal_3' => '#FFB6C1', // Center + Bottom-Right
            'center_petal_4' => '#FFD4A3', // Center + Bottom
            'center_petal_5' => '#D2B48C', // Center + Bottom-Left
            'center_petal_6' => '#B4C7F5', // Center + Top-Left
            
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
                '1.0.0'
            );
            
            // Add dynamic CSS inline AFTER base styles
            wp_add_inline_style('seed-of-life-base', $this->generate_dynamic_css());
            
            // Enqueue JavaScript
            wp_enqueue_script(
                'seed-of-life-js',
                plugin_dir_url(__FILE__) . 'assets/seed-of-life.js',
                array(),
                '1.0.0',
                true
            );
            
            // Add debug info to JavaScript
            wp_localize_script('seed-of-life-js', 'seedOfLifeConfig', array(
                'debug' => defined('WP_DEBUG') && WP_DEBUG,
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'pluginUrl' => plugin_dir_url(__FILE__),
                'version' => '1.0.0'
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
            $css .= ".sol-circle-$i { fill: $color; }\n";
        }
        
        // Center circle
        $center_color = isset($this->options['circle_center']) ? $this->options['circle_center'] : $this->default_colors['circle_center'];
        $css .= ".sol-circle-center { fill: $center_color; }\n";
        
        // Petal intersections
        for ($i = 1; $i <= 6; $i++) {
            $j = ($i % 6) + 1;
            $color = isset($this->options["petal_{$i}_{$j}"]) ? $this->options["petal_{$i}_{$j}"] : $this->default_colors["petal_{$i}_{$j}"];
            $css .= ".sol-petal-{$i}-{$j} { fill: $color; }\n";
        }
        
        // Center petals
        for ($i = 1; $i <= 6; $i++) {
            $color = isset($this->options["center_petal_$i"]) ? $this->options["center_petal_$i"] : $this->default_colors["center_petal_$i"];
            $css .= ".sol-center-petal-$i { fill: $color; }\n";
        }
        
        // Border and background
        $border_color = isset($this->options['border_color']) ? $this->options['border_color'] : $this->default_colors['border_color'];
        $border_width = isset($this->options['border_width']) ? $this->options['border_width'] : $this->default_colors['border_width'];
        $background = isset($this->options['background']) ? $this->options['background'] : $this->default_colors['background'];
        
        $css .= ".sol-border { stroke: $border_color; stroke-width: {$border_width}px; }\n";
        $css .= ".sol-background { fill: $background; }\n";
        
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
            'background_opacity' => '0.3',
            'foreground_opacity' => '0.85',
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
                <p>Customize the colors for each area of the Seed of Life pattern.</p>
                
                <table class="form-table">
                    <tr>
                        <th colspan="2"><h3>Primary Circles (Clockwise from Top)</h3></th>
                    </tr>
                    <?php
                    $circle_labels = array(
                        1 => 'Top',
                        2 => 'Top-Right',
                        3 => 'Bottom-Right',
                        4 => 'Bottom',
                        5 => 'Bottom-Left',
                        6 => 'Top-Left'
                    );
                    
                    foreach ($circle_labels as $i => $label):
                        $value = isset($this->options["circle_$i"]) ? $this->options["circle_$i"] : $this->default_colors["circle_$i"];
                    ?>
                    <tr>
                        <th scope="row">Circle <?php echo $i; ?> (<?php echo $label; ?>)</th>
                        <td>
                            <input type="text" 
                                   name="seed_of_life_colors[circle_<?php echo $i; ?>]" 
                                   value="<?php echo esc_attr($value); ?>" 
                                   class="color-field" />
                        </td>
                    </tr>
                    <?php endforeach; ?>
                    
                    <tr>
                        <th scope="row">Center Circle</th>
                        <td>
                            <input type="text" 
                                   name="seed_of_life_colors[circle_center]" 
                                   value="<?php echo esc_attr($this->options['circle_center']); ?>" 
                                   class="color-field" />
                        </td>
                    </tr>
                    
                    <tr>
                        <th colspan="2"><h3>Petal Intersections</h3></th>
                    </tr>
                    <?php
                    for ($i = 1; $i <= 6; $i++):
                        $j = ($i % 6) + 1;
                        $value = isset($this->options["petal_{$i}_{$j}"]) ? $this->options["petal_{$i}_{$j}"] : $this->default_colors["petal_{$i}_{$j}"];
                    ?>
                    <tr>
                        <th scope="row">
                            <?php echo $circle_labels[$i]; ?> + <?php echo $circle_labels[$j]; ?>
                        </th>
                        <td>
                            <input type="text" 
                                   name="seed_of_life_colors[petal_<?php echo $i; ?>_<?php echo $j; ?>]" 
                                   value="<?php echo esc_attr($value); ?>" 
                                   class="color-field" />
                        </td>
                    </tr>
                    <?php endfor; ?>
                    
                    <tr>
                        <th colspan="2"><h3>Center Petals</h3></th>
                    </tr>
                    <?php
                    foreach ($circle_labels as $i => $label):
                        $value = isset($this->options["center_petal_$i"]) ? $this->options["center_petal_$i"] : $this->default_colors["center_petal_$i"];
                    ?>
                    <tr>
                        <th scope="row">Center + <?php echo $label; ?></th>
                        <td>
                            <input type="text" 
                                   name="seed_of_life_colors[center_petal_<?php echo $i; ?>]" 
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
                <h2>Preview</h2>
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
                </ul>
                <p>Example: <code>[seed_of_life width="600" height="600" animation="false"]</code></p>
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