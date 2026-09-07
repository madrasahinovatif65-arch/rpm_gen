# MCP SSE Server - Remote Access via ZeroTier

MCP Server dengan SSE (Server-Sent Events) transport untuk remote access via ZeroTier virtual network.

## 🎯 Features

- ✅ **SSE Transport**: Server-Sent Events untuk real-time MCP communication
- ✅ **ZeroTier Ready**: Listen pada semua interfaces (0.0.0.0) untuk ZeroTier access
- ✅ **Optional Authentication**: Token-based auth atau rely on ZeroTier network isolation
- ✅ **Rate Limiting**: 100 requests per minute per client
- ✅ **CORS Support**: Configurable origins
- ✅ **Health Check**: `/health` endpoint untuk monitoring
- ✅ **Built-in Tools**: Echo, System Info, Command Execution (with safety checks)

## 📋 Prerequisites

- Node.js 18+ installed
- npm atau yarn
- ZeroTier installed dan configured (see ZeroTier Setup Guide)

## 🚀 Quick Start

### 1. Install Dependencies

\`\`\`bash
cd mcp-sse-server
npm install
\`\`\`

### 2. Configure Environment

\`\`\`bash
# Copy template
cp .env.example .env

# Edit .env
# Optional: Generate secure token (if you want authentication)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
\`\`\`

### 3. Start Server

\`\`\`bash
# Development (with auto-reload)
npm run dev

# Production
npm start
\`\`\`

Server will start on `http://0.0.0.0:3000`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MCP_PORT` | Server port | `3000` | No |
| `MCP_AUTH_TOKEN` | Authentication token | `(empty)` | No |
| `ALLOWED_ORIGINS` | CORS allowed origins | `*` | No |

### Authentication Modes

#### Mode 1: No Authentication (Recommended with ZeroTier)
```bash
# Leave MCP_AUTH_TOKEN empty in .env
MCP_AUTH_TOKEN=
```
Security relies on ZeroTier network isolation - only devices in your ZeroTier network can access.

#### Mode 2: Token Authentication
```bash
# Set strong token in .env
MCP_AUTH_TOKEN=your-secure-random-token-here
```
Requests must include `Authorization: Bearer <token>` header.

## 📡 API Endpoints

### Health Check
```bash
GET /health

# Response
{
  "status": "ok",
  "timestamp": "2026-09-07T09:00:00.000Z",
  "version": "1.0.0",
  "server": "antigravity-remote-mcp",
  "authEnabled": false,
  "transport": "SSE"
}
```

### SSE Connection
```bash
GET /sse
Header: Authorization: Bearer <token> (if auth enabled)

# Opens Server-Sent Events connection for MCP protocol
```

### Message Endpoint
```bash
POST /message
Content-Type: text/plain
Body: <MCP protocol message>

# Used internally by MCP SDK
```

## 🛠️ MCP Tools

The server exposes 3 built-in tools:

### 1. Echo
```json
{
  "name": "echo",
  "description": "Echo back the input message for testing",
  "input": { "message": "Hello World" }
}
```

### 2. System Info
```json
{
  "name": "system_info",
  "description": "Get system information from the server"
}
```

### 3. Execute Command
```json
{
  "name": "execute_command",
  "description": "Execute a shell command (with safety checks)",
  "input": { "command": "dir" }
}
```

⚠️ **Security**: Dangerous commands (rm -rf, format, etc.) are blocked automatically.

## 🌐 ZeroTier Access

### Setup Steps

1. **Install ZeroTier** on PC and handphone
2. **Create network** at https://my.zerotier.com
3. **Join network** from both devices
4. **Authorize devices** in ZeroTier dashboard
5. **Note ZeroTier IP** (e.g., 172.28.0.100)

### Access from Handphone

```bash
# Health check
curl http://172.28.0.100:3000/health

# SSE connection (with auth token if enabled)
curl -H "Authorization: Bearer YOUR_TOKEN" http://172.28.0.100:3000/sse
```

## 🔥 Windows Firewall

Allow port 3000 through firewall:

\`\`\`powershell
# Allow inbound traffic
New-NetFirewallRule -DisplayName "MCP Server ZeroTier" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow

# Verify
Get-NetFirewallRule -DisplayName "MCP Server ZeroTier"
\`\`\`

## 🧪 Testing

### Local Testing
\`\`\`bash
# Health check
curl http://localhost:3000/health

# SSE test (requires HTTP client that supports SSE)
curl http://localhost:3000/sse
\`\`\`

### Remote Testing (via ZeroTier)
\`\`\`bash
# From handphone or remote PC in same ZeroTier network
curl http://172.28.0.100:3000/health
\`\`\`

## 🚨 Troubleshooting

### Server won't start

**Problem**: Port already in use
```bash
# Check what's using port 3000
netstat -ano | findstr :3000

# Kill process or change MCP_PORT in .env
```

### Cannot access from handphone

**Check 1**: Server listening on 0.0.0.0?
```bash
netstat -an | findstr "3000"
# Should show: 0.0.0.0:3000 (not 127.0.0.1:3000)
```

**Check 2**: Firewall rule exists?
```powershell
Get-NetFirewallRule -DisplayName "MCP Server ZeroTier"
```

**Check 3**: ZeroTier connected?
```bash
# Check ZeroTier status
zerotier-cli listnetworks

# Ping from handphone to PC
ping 172.28.0.100
```

### Authentication errors

**Problem**: 401 Unauthorized

- Verify token matches in `.env` and request header
- Ensure header format: `Authorization: Bearer <token>`
- Or disable auth by removing `MCP_AUTH_TOKEN` from `.env`

## 🔄 Auto-Start Setup

### Option A: Windows Task Scheduler
\`\`\`powershell
$action = New-ScheduledTaskAction -Execute "node" -Argument "E:\OneDrive\apk_gen\mcp-sse-server\index.js" -WorkingDirectory "E:\OneDrive\apk_gen\mcp-sse-server"
$trigger = New-ScheduledTaskTrigger -AtStartup
Register-ScheduledTask -TaskName "MCP-Server-Startup" -Action $action -Trigger $trigger -RunLevel Highest
\`\`\`

### Option B: PM2 (Process Manager)
\`\`\`bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start index.js --name mcp-server

# Save PM2 config
pm2 save

# Setup startup
pm2 startup
\`\`\`

## 📚 Integration dengan Antigravity IDE

Tambahkan ke `~/.gemini/config/mcp_config.json`:

\`\`\`json
{
  "mcpServers": {
    "antigravity-remote-zerotier": {
      "serverUrl": "http://172.28.0.100:3000/sse",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN_HERE"
      }
    }
  }
}
\`\`\`

**Notes**:
- Replace `172.28.0.100` dengan ZeroTier IP actual
- Remove `headers` section jika tidak pakai auth
- Restart Antigravity IDE setelah config

## 🔒 Security Best Practices

### ✅ Already Implemented
- Rate limiting (100 req/min)
- Command execution safety checks
- CORS policy
- Optional token authentication

### 🔒 Additional Recommendations
1. **Keep ZeroTier network Private**: Devices need approval to join
2. **Review authorized devices**: Regularly check ZeroTier dashboard
3. **Rotate tokens**: Change `MCP_AUTH_TOKEN` periodically if using
4. **Monitor logs**: Watch for unusual activity
5. **Update dependencies**: Keep packages up-to-date

## 📖 Related Documentation

- [ZeroTier Setup Guide](../zerotier-setup-guide.md) - Complete ZeroTier installation guide
- [MCP Protocol Spec](https://modelcontextprotocol.io) - Official MCP documentation
- [Implementation Plan](../implementation_plan.md) - Full project plan

## 📝 License

MIT

## 🤝 Support

For issues or questions:
1. Check troubleshooting section above
2. Review ZeroTier network status
3. Check server logs for errors

---

**Created**: 2026-09-07  
**Version**: 1.0.0  
**Status**: Production Ready ✅
