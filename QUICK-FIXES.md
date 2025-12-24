# Quick Fixes for Broken Pages

## TL;DR - Page Not Loading Correctly?

### Fix #1: Clear Service Worker (Most Common Fix)
Open browser console (`F12`) and paste:
```javascript
navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()));
location.reload(true);
```

### Fix #2: Hard Refresh
- **Windows/Linux:** `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`

### Fix #3: Try Different Encoding
If pages show garbled URLs or don't load:

1. Stop your server
2. Edit `/public/uv/uv.config.js`
3. Change line 7-8 to one of these:

**Option A: Plain (Most Compatible)**
```javascript
encodeUrl: Ultraviolet.codec.plain.encode,
decodeUrl: Ultraviolet.codec.plain.decode,
```

**Option B: XOR (Fast)**
```javascript
encodeUrl: Ultraviolet.codec.xor.encode,
decodeUrl: Ultraviolet.codec.xor.decode,
```

**Option C: Base64 (Default)**
```javascript
encodeUrl: Ultraviolet.codec.base64.encode,
decodeUrl: Ultraviolet.codec.base64.decode,
```

4. Save and restart server
5. Clear service worker (Fix #1)

## Page-Specific Issues

### Images/CSS Not Loading
✅ **Solution:** Hard refresh (Fix #2) + Clear service worker (Fix #1)

### Videos Won't Play
✅ **Solution:** Try different encoding (Fix #3 → Option A: Plain)

### Login Not Working
✅ **Solution:**
1. Enable cookies in browser
2. Try logging in on actual site first
3. Then access through proxy

### WebSocket Errors (Chat, Live Updates)
✅ **Solution:** Check Railway logs for WebSocket errors
```bash
railway logs | grep -i websocket
```

### JavaScript Errors
✅ **Solution:** Check browser console (`F12`) for specific errors

## Still Broken?

See full [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) guide.

## Test Your Fixes

After each fix:
1. Clear service worker (Fix #1)
2. Hard refresh (Fix #2)
3. Check browser console for errors
4. Test the broken feature

## Common Sites That Work

✅ Google Search
✅ Wikipedia
✅ YouTube (basic features)
✅ Most news sites
✅ Most educational sites

## Sites That Usually Don't Work

❌ Banking sites
❌ Sites with Cloudflare bot protection
❌ Video calls (WebRTC)
❌ Sites requiring client certificates
