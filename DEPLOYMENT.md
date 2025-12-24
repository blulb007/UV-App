# Ultraviolet Proxy Deployment Guide

This guide will help you deploy a robust Ultraviolet proxy instance that works with as many sites as possible.

## Quick Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

1. Click the button above or go to [Railway](https://railway.app)
2. Connect your GitHub repository
3. Railway will automatically detect the Dockerfile and deploy
4. Your app will be available at the generated Railway URL

## Environment Variables

Configure these in your Railway dashboard or local `.env` file:

```env
NODE_ENV=production
PORT=8080
LOG_LEVEL=info
```

## Health Checks

The application includes health check endpoints for monitoring:

- `GET /health` - Returns server health status and uptime
- `GET /ready` - Returns readiness status

Railway automatically uses `/health` for health checks (configured in `railway.toml`).

## Making Your Proxy More Robust

### 1. **Enable All Transport Methods**

The proxy uses multiple transport protocols for compatibility:
- **WISP** (WebSocket Protocol) - For modern sites
- **Epoxy Transport** - Alternative transport method
- **BareMux** - Multiplexing for bare servers

All are enabled by default in this configuration.

### 2. **Custom Domain (Recommended)**

Using a custom domain improves compatibility:
1. In Railway dashboard, go to Settings → Domains
2. Add your custom domain
3. Configure DNS records as shown
4. SSL is automatically provisioned

Benefits:
- Some sites block known proxy domains
- Custom domains appear more legitimate
- Better for long-term use

### 3. **Performance Optimizations**

The server includes:
- ✅ Automatic graceful shutdown
- ✅ Error handling and logging
- ✅ Trust proxy headers (for Railway/reverse proxies)
- ✅ Enhanced CORS headers
- ✅ WebSocket error recovery

### 4. **Monitoring and Debugging**

View logs in Railway:
```bash
railway logs
```

Or locally:
```bash
pnpm start
```

Set `LOG_LEVEL=debug` for verbose logging.

### 5. **Security Headers**

The following security headers are automatically set:
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`
- `X-Content-Type-Options: nosniff`

### 6. **Scaling on Railway**

Railway automatically handles:
- Auto-scaling based on traffic
- Health check monitoring
- Automatic restarts on failure
- Zero-downtime deployments

## Troubleshooting

### Site Not Working?

1. **Check Browser Console** - Look for CORS or WebSocket errors
2. **Try Different Transport** - Some sites work better with different protocols
3. **Check Logs** - Railway logs show connection attempts and errors
4. **Verify DNS** - If using custom domain, ensure DNS is configured
5. **Clear Cache** - Browser cache can cause issues with proxy updates

### Common Issues

**WebSocket Connection Failed**
- Ensure Railway/hosting supports WebSocket upgrades
- Check firewall/proxy settings
- Verify `/wisp/` endpoint is accessible

**403/404 Errors**
- Check that static files are being served correctly
- Verify `ultraviolet-static` package is installed
- Check Docker build logs

**Performance Issues**
- Consider upgrading Railway plan for more resources
- Enable HTTP/2 (automatic with Railway)
- Use CDN for static assets

## Local Development

```bash
# Install dependencies
pnpm install

# Run in development mode
NODE_ENV=development pnpm start

# Test Docker build
./docker-build-test.sh
```

## Advanced Configuration

### Custom UV Configuration

Edit the UV config in the `ultraviolet-static` package or override by creating your own `public/uv/uv.config.js`.

### Custom Bare Server

To use a custom bare server, modify the UV configuration to point to your bare server URL.

### Multiple Instances

Deploy multiple instances behind a load balancer for high availability:
1. Deploy 2+ Railway instances
2. Use Railway's built-in load balancing
3. Configure shared session storage if needed

## Best Practices

1. ✅ Use custom domain for better compatibility
2. ✅ Enable health checks for automatic recovery
3. ✅ Monitor logs regularly for issues
4. ✅ Keep dependencies updated
5. ✅ Use environment variables for configuration
6. ✅ Test with target sites regularly
7. ✅ Implement rate limiting if needed
8. ✅ Consider CDN for static assets

## Support

For issues:
- Check [Ultraviolet Documentation](https://github.com/titaniumnetwork-dev/Ultraviolet)
- Review Railway logs for errors
- Test locally first before deploying

## Performance Benchmarks

Expected performance on Railway:
- 50-100 concurrent connections (Starter plan)
- Sub-100ms response time
- 99.9% uptime with health checks
- WebSocket support included

Upgrade Railway plan for higher limits.
