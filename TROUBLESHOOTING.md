# Troubleshooting Broken Pages in UV Proxy

This guide helps you fix pages that don't display correctly (1:1) through the UV proxy.

## Common Issues and Solutions

### 1. **Service Worker Cache Issues**

**Symptoms:**
- Old version of pages loading
- Changes not appearing
- Broken functionality after updates

**Solutions:**
```javascript
// In browser console:
// Clear all service workers
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});

// Clear all caches
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});

// Then refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
```

**Prevention:**
- Hard refresh pages: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Clear browser cache regularly
- Use incognito/private browsing for testing

### 2. **Encoding Issues**

**Problem:** Some URLs with special characters break

**Solution:** The proxy now uses **base64 encoding** instead of XOR encoding.

To change encoding method, edit `/public/uv/uv.config.js`:

```javascript
// Current (base64 - better compatibility):
encodeUrl: Ultraviolet.codec.base64.encode,
decodeUrl: Ultraviolet.codec.base64.decode,

// Alternative (XOR - faster but less compatible):
encodeUrl: Ultraviolet.codec.xor.encode,
decodeUrl: Ultraviolet.codec.xor.decode,

// Alternative (plain - most compatible but obvious):
encodeUrl: Ultraviolet.codec.plain.encode,
decodeUrl: Ultraviolet.codec.plain.decode,
```

### 3. **CORS and Security Headers**

**Symptoms:**
- Images/videos not loading
- Fonts missing
- Stylesheets broken
- Console errors: "Cross-Origin" or "CORS"

**Current Fix:** The server now uses **permissive CORS headers** except for UV/Epoxy paths.

**If still broken:**
Check browser console for specific CORS errors and report them.

### 4. **JavaScript-Heavy Sites**

**Symptoms:**
- Buttons don't work
- Forms don't submit
- Dynamic content doesn't load
- React/Vue/Angular apps broken

**Why:** UV must rewrite JavaScript URLs, but some frameworks use complex patterns.

**Solutions:**
1. Wait longer for page to load (some sites take time)
2. Check browser console for JavaScript errors
3. Try refreshing the page
4. Some sites simply won't work due to anti-bot protection

### 5. **Cookie/Session Issues**

**Symptoms:**
- Can't log in
- Keep getting logged out
- Site says "enable cookies"

**Fixes:**
1. Ensure cookies are enabled in browser
2. Clear cookies for the proxy domain
3. Try logging in directly on the site first, then through proxy
4. Some sites track IPs - use same network

### 6. **WebSocket Failures**

**Symptoms:**
- Real-time features don't work
- Chat doesn't load
- Live updates broken
- Console error: "WebSocket connection failed"

**Solutions:**
1. Check if `/wisp/` endpoint is accessible: `wss://your-domain.railway.app/wisp/`
2. Verify Railway allows WebSocket connections (it should)
3. Check browser console for WebSocket errors
4. Some corporate networks block WebSockets

### 7. **Sites That Will NEVER Work**

Some sites actively block proxies and won't work:

❌ **Banking sites** - Security measures block proxies
❌ **Government sites** - Often have strict security
❌ **Sites with advanced bot detection** (Cloudflare Turnstile, reCAPTCHA v3)
❌ **WebRTC sites** - Direct peer connections bypass proxies
❌ **Sites requiring client certificates**

### 8. **Video/Media Issues**

**Symptoms:**
- Videos won't play
- Audio broken
- Streaming fails

**Solutions:**
1. Try different encoding (see #2 above)
2. Check if site uses DRM (won't work through proxy)
3. Lower video quality if available
4. Some streaming sites detect and block proxies

### 9. **Responsive Design Broken**

**Symptoms:**
- Mobile view doesn't work
- Layout is wrong
- CSS not loading properly

**Fixes:**
1. Check browser console for 404 errors on CSS files
2. Hard refresh the page
3. Clear service worker cache (see #1)
4. Try desktop user agent instead of mobile

## Debugging Steps

### Step 1: Open Browser Console
`F12` or `Right-click → Inspect → Console`

### Step 2: Look for Errors
Common errors to look for:
- `404 Not Found` - Resource missing
- `CORS error` - Cross-origin blocked
- `Failed to fetch` - Network issue
- `Service worker registration failed` - SW issue

### Step 3: Check Network Tab
1. Open `F12 → Network`
2. Refresh page
3. Look for failed requests (red)
4. Check if resources loaded from correct URLs

### Step 4: Clear Everything
```javascript
// Paste in console:
navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()));
caches.keys().then(k => k.forEach(key => caches.delete(key)));
localStorage.clear();
sessionStorage.clear();
location.reload(true);
```

## Configuration Tweaks

### Increase Compatibility
Edit `/public/uv/uv.config.js`:

```javascript
self.__uv$config = {
  prefix: "/uv/service/",
  // Use plain encoding (most compatible, but obvious in URL)
  encodeUrl: Ultraviolet.codec.plain.encode,
  decodeUrl: Ultraviolet.codec.plain.decode,
  // Rest stays the same...
  handler: "/uv/uv.handler.js",
  client: "/uv/uv.client.js",
  bundle: "/uv/uv.bundle.js",
  config: "/uv/uv.config.js",
  sw: "/uv/uv.sw.js",
};
```

### Check Logs
Railway deployment logs show what's failing:
```bash
railway logs
```

Look for:
- 404 errors - Missing files
- 500 errors - Server crashes
- WebSocket errors - Connection issues

## Site-Specific Fixes

### YouTube
- Use plain encoding
- May need to disable comments/annotations
- 4K videos might not work

### Discord
- WebSocket required (should work with WISP)
- Voice/video calls won't work (WebRTC)
- Might detect proxy and block

### Social Media (Twitter, Instagram, etc.)
- Infinite scroll might break
- Images might not load (CORS)
- Videos might fail (DRM)
- Try different encoding methods

### Google Services
- Generally work well
- Some features blocked (Google Meet won't work)
- Sign-in might be tricky

## Still Broken?

If a specific site isn't working after trying these fixes:

1. **Check if site works normally** (not through proxy)
2. **Try different browser** (Chrome, Firefox, Safari)
3. **Check Railway logs** for server errors
4. **Report the issue** with:
   - Site URL
   - Browser console errors
   - Network tab screenshots
   - Expected vs actual behavior

## Performance Tips

- Clear service worker cache weekly
- Don't keep too many tabs open
- Use desktop site instead of mobile when possible
- Disable browser extensions that might interfere
- Use incognito mode for testing

## Advanced: Custom UV Build

For sites with specific issues, you might need to:
1. Fork Ultraviolet repository
2. Modify URL rewriting rules
3. Add site-specific handlers
4. Deploy custom build

This is advanced and requires JavaScript knowledge.
