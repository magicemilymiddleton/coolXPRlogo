# Seed of Life WordPress Plugin v2.0 🌺

## ✨ What's New in Version 2.0

- **EVERY area is now individually colorable!** Including all the beautiful inner slivers
- **Matches your exact image colors** - vibrant oranges, purples, yellows, and more
- **Enhanced animation** with smooth rotating effect
- **Improved visual effects** with layered animation
- **Better mobile support** with touch controls
- **12+ inner color zones** for complete customization

## 🎨 Color Zones

The plugin now supports complete color customization for:

### Primary Circles (6 main circles)
1. **Top** - Black (#000000)
2. **Top-Right** - Bright Green (#00FF00)
3. **Right** - Red (#FF0000)
4. **Bottom-Right** - Brown (#8B4513)
5. **Bottom-Left** - Blue (#0000FF)
6. **Left** - Cyan (#00CED1)
7. **Center** - White (#FFFFFF)

### Petal Intersections (where 2 circles overlap)
- Light green, Orange, Pink, Indigo, Sky blue, Dark cyan

### Center Petals (where outer circles meet center)
- Gold, Yellow-green, Magenta, Chocolate, Purple, Light cyan

### Inner Slivers (the beautiful small areas) 
- Yellow, Magenta, Cyan, Orange, Purple, White
- Light Pink, Pale Green, Plum, Khaki, Salmon, Light Blue

## 📁 Installation

1. **Upload the plugin folder** to `/wp-content/plugins/seed-of-life/`
2. **Activate** the plugin through the WordPress admin panel
3. **Configure colors** in the Seed of Life menu (optional)
4. **Add to any page** using the shortcode: `[seed_of_life]`

## 📦 File Structure

```
/wp-content/plugins/seed-of-life/
│
├── seed-of-life.php         (main plugin file)
├── assets/
│   ├── seed-of-life.js      (enhanced JavaScript)
│   └── seed-of-life.css     (enhanced styles)
└── README.md                 (this file)
```

## 🚀 Quick Start

### Basic Usage
```
[seed_of_life]
```

### With Options
```
[seed_of_life width="600" height="600" animation="true"]
```

### Parameters
- `width` - Canvas width in pixels (default: 500)
- `height` - Canvas height in pixels (default: 500)
- `animation` - Show animation controls (default: true)
- `layer_effect` - Enable layered animation effect (default: true)
- `id` - Custom ID for multiple instances

## 🎮 Features

### Interactive Controls
- **Toggle Animation** - Watch the sacred geometry rotate smoothly
- **Reset** - Return to original position
- **Drag to Rotate** - Click and drag to manually rotate (when not animating)
- **Touch Support** - Works on mobile devices

### Visual Effects
- **Layered Animation** - Creates a beautiful depth effect
- **Smooth Transitions** - All colors and movements are smoothly animated
- **Customizable Opacity** - Control transparency of different layers
- **Border Effects** - Clean white borders define each shape

## 🎨 Customization

### Admin Panel
1. Go to **WordPress Admin → Seed of Life**
2. Customize any of the 30+ color zones
3. Preview changes in real-time
4. Save to apply globally

### Color Zones Explained

#### Primary Circles
The 6 main overlapping circles that form the pattern

#### Petal Intersections  
Where two adjacent circles overlap, creating petal-like shapes

#### Center Petals
Where each outer circle overlaps with the center circle

#### Inner Slivers
The small triangular and curved areas where multiple circles intersect - these create the vibrant rainbow effect

## 🔧 Advanced Configuration

### CSS Classes
All elements use CSS classes that can be overridden:

```css
.sol-circle-1 { fill: #000000; }  /* Top circle */
.sol-petal-1-2 { fill: #90EE90; } /* Intersection */
.sol-inner-sliver-1 { fill: #FFFF00; } /* Yellow sliver */
```

### JavaScript API
```javascript
// Get instance
var instance = window.seedOfLife_[id];

// Control animation
instance.toggleAnimation();
instance.reset();

// Configure effects
instance.setLayerEffect(true, 0.25, 1.0);
```

## 🌟 What Makes This Special

This plugin creates a perfect recreation of the Seed of Life sacred geometry pattern with:

- **Mathematical Precision** - Perfect circle placement
- **Sacred Symbols** - Includes Yin-Yang and Aleph symbols in center
- **Full Color Control** - Every single area can be customized
- **Smooth Animation** - Mesmerizing rotation effect
- **Responsive Design** - Adapts to any screen size

## 🐛 Troubleshooting

### Colors Not Showing?
1. Clear browser cache (Ctrl+Shift+R)
2. Check WordPress Admin → Seed of Life settings
3. Ensure CSS file is loading (check browser console)

### Animation Not Working?
1. Check JavaScript console for errors
2. Ensure jQuery is loaded (WordPress default)
3. Try disabling other plugins temporarily

### Multiple Instances
Each shortcode gets a unique ID automatically. To reference specific instances:
```javascript
window.seedOfLife_sol_abc123.toggleAnimation();
```

## 📈 Performance

- **Optimized Canvas Rendering** - Hardware accelerated
- **Efficient Animation Loop** - Uses requestAnimationFrame
- **Color Caching** - Colors cached after first retrieval
- **Minimal DOM Manipulation** - All drawing done on canvas

## 🎯 Use Cases

Perfect for:
- Meditation and wellness websites
- Spiritual and holistic practices
- Art and design portfolios
- Educational geometry demonstrations
- Interactive website headers
- Loading animations
- Brand elements

## 📝 Changelog

### Version 2.0.0
- Added complete color customization for ALL areas
- Implemented inner sliver coloring (12+ zones)
- Enhanced animation with layered effects
- Improved admin interface with live preview
- Added touch/mobile support
- Optimized performance
- Better fallback colors matching your image

### Version 1.0.0
- Initial release
- Basic Seed of Life pattern
- Primary circle colors
- Simple animation

## 🙏 Credits

- Sacred geometry mathematics
- Canvas API for smooth rendering
- WordPress plugin architecture
- Your beautiful color design inspiration

## 📄 License

GPL v2 or later

## 💬 Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Ensure WordPress and plugins are updated
4. Contact support with console logs

---

**Enjoy your fully customizable, animated Seed of Life! 🌸**