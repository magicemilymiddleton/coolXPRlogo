# Seed of Life WordPress Plugin - Installation & Debugging Guide

## 📁 File Structure Required

```
/wp-content/plugins/seed-of-life/
│
├── seed-of-life.php         (main plugin file)
├── assets/
│   ├── seed-of-life.js      (JavaScript file)
│   └── seed-of-life.css     (CSS file)
└── README.md                 (this file)
```

## 🔧 Installation Steps

1. **Create plugin folder**: `/wp-content/plugins/seed-of-life/`
2. **Create assets subfolder**: `/wp-content/plugins/seed-of-life/assets/`
3. **Upload all files** to their respective locations
4. **Activate plugin** in WordPress admin panel

## 🔍 Debugging Console Output

When properly loaded, you should see in browser console:

```javascript
[SeedOfLife] JavaScript file loaded
[SeedOfLife] Plugin ready. Use initSeedOfLife(canvasId) to create instances.
[SeedOfLife] Debug info available at window.seedOfLifeDebug
[SeedOfLife-seedOfLife_xxx] Starting initialization
[SeedOfLife-seedOfLife_xxx] Canvas found: 500x500 ✓
[SeedOfLife-seedOfLife_xxx] 2D context created successfully ✓
[SeedOfLife-seedOfLife_xxx] Testing CSS classes...
[SeedOfLife-seedOfLife_xxx] Color retrieved: sol-circle-1 = #00CED1 ✓
[SeedOfLife-seedOfLife_xxx] Initialization complete ✓
```

## 🚨 Common Issues & Solutions

### Issue 1: 404 Errors for JS/CSS Files
**Console Error**: 
```
seed-of-life.js:1 Failed to load resource: 404 (Not Found)
seed-of-life.css:1 Failed to load resource: 404 (Not Found)
```

**Solution**:
- Verify files exist in `/wp-content/plugins/seed-of-life/assets/`
- Check file permissions (should be 644)
- Verify plugin folder name matches exactly

### Issue 2: Canvas Not Found
**Console Error**: 
```
[SeedOfLife] Canvas element not found: #seedOfLife_xxx
```

**Solution**:
- Check if shortcode is properly placed
- Verify no JavaScript errors before initialization
- Check if page fully loaded before script runs

### Issue 3: CSS Classes Not Loading
**Console Warning**:
```
[SeedOfLife] Warning: Default black color for sol-circle-1, CSS class may not be defined
```

**Solution**:
- Verify dynamic CSS is being generated
- Check WordPress admin color settings
- Clear browser cache

## 🛠️ Debug Commands

Open browser console (F12) and use:

```javascript
// Check if plugin loaded
window.initSeedOfLife
// Expected: function initSeedOfLife(canvasId) {...}

// Check plugin instances
window.seedOfLifeDebug
// Expected: {instances: {...}, instanceCount: 1}

// Get specific instance state
window.seedOfLife_[your_id].getState()
// Expected: {initialized: true, canvasFound: true, ...}

// Check if CSS loaded
document.querySelector('.sol-circle-1')
// Should return element or null

// Test color retrieval manually
var test = document.createElement('div');
test.className = 'sol-circle-1';
document.body.appendChild(test);
getComputedStyle(test).fill;
// Expected: "rgb(0, 206, 209)" or similar
```

## 📊 WordPress Debug Mode

Add to `wp-config.php`:

```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

Then check `/wp-content/debug.log` for:
```
[SeedOfLife] Enqueue assets function called
[SeedOfLife] Shortcode found, loading assets
```

## 🔄 Testing Workflow

1. **Enable WordPress Debug Mode**
2. **Clear Browser Cache** (Ctrl+Shift+R)
3. **Open Browser Console** (F12)
4. **Load page with shortcode** `[seed_of_life]`
5. **Check console for initialization logs**
6. **Test interaction** (click Toggle Animation)
7. **Check for errors in console**

## 📝 Shortcode Usage

Basic:
```
[seed_of_life]
```

With options:
```
[seed_of_life width="600" height="600" animation="true" id="custom_id"]
```

## 🎨 Verify Color Loading

Add this test shortcode to a page:
```html
[seed_of_life]

<script>
setTimeout(function() {
    console.log('=== SEED OF LIFE DEBUG INFO ===');
    console.log('Plugin loaded:', typeof window.initSeedOfLife);
    console.log('Instances:', window.seedOfLifeDebug);
    
    // Test CSS classes
    var classes = ['sol-circle-1', 'sol-circle-2', 'sol-petal-1-2'];
    classes.forEach(function(cls) {
        var el = document.createElement('div');
        el.className = cls;
        document.body.appendChild(el);
        var color = getComputedStyle(el).fill || getComputedStyle(el).backgroundColor;
        console.log(cls + ':', color);
        document.body.removeChild(el);
    });
}, 2000);
</script>
```

## 🚀 Quick Fix Checklist

- [ ] Plugin folder name: `seed-of-life` (exactly)
- [ ] Assets folder exists: `/assets/`
- [ ] JS file present: `/assets/seed-of-life.js`
- [ ] CSS file present: `/assets/seed-of-life.css`
- [ ] Plugin activated in WordPress admin
- [ ] Browser cache cleared
- [ ] Console checked for errors
- [ ] WordPress debug log checked

## 📧 Support

If issues persist after following this guide, provide:
1. Browser console output (full)
2. WordPress debug.log entries
3. Browser and WordPress versions
4. Active theme and other plugins