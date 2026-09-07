# Quick Start Configuration

**Your ZeroTier Setup:**
- **PC ZeroTier IP**: `10.210.48.233`
- **MCP Server Port**: `3000`
- **Network**: ZeroTier Virtual Network

---

## 🚀 Ready-to-Use Configuration

### MCP Server Access URL
```
http://10.210.48.233:3000
```

### Health Check Endpoint
```
http://10.210.48.233:3000/health
```

### SSE Endpoint (for IDE)
```
http://10.210.48.233:3000/sse
```

---

## 📝 Antigravity IDE Configuration

**File**: `C:\Users\PC\.gemini\config\mcp_config.json`

```json
{
  "mcpServers": {
    "antigravity-remote-zerotier": {
      "serverUrl": "http://10.210.48.233:3000/sse"
    }
  }
}
```

**With Authentication** (if using token):
```json
{
  "mcpServers": {
    "antigravity-remote-zerotier": {
      "serverUrl": "http://10.210.48.233:3000/sse",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN_HERE"
      }
    }
  }
}
```

---

## 🧪 Testing Commands

### From PC (Local)
```powershell
# Start server
cd E:\OneDrive\apk_gen\mcp-sse-server
npm start

# Test health (localhost)
curl http://localhost:3000/health

# Test health (ZeroTier IP)
curl http://10.210.48.233:3000/health
```

### From Handphone (via ZeroTier)
Open browser and navigate to:
```
http://10.210.48.233:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-09-07T...",
  "version": "1.0.0",
  "server": "antigravity-remote-mcp",
  "authEnabled": false,
  "transport": "SSE"
}
```

---

## ✅ Checklist

- [ ] MCP server running on PC
- [ ] ZeroTier installed on PC (IP: 10.210.48.233)
- [ ] ZeroTier installed on handphone
- [ ] Both devices in same ZeroTier network
- [ ] Firewall rule created: `New-NetFirewallRule -DisplayName "MCP Server ZeroTier" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow`
- [ ] Test from PC: `curl http://10.210.48.233:3000/health` ✓
- [ ] Test from handphone browser: `http://10.210.48.233:3000/health` ✓
- [ ] Configure IDE: Update `mcp_config.json` with above configuration
- [ ] Restart Antigravity IDE
- [ ] Test MCP tools: `@antigravity-remote-zerotier echo "test"`

---

## 🔧 Troubleshooting

### Cannot access from handphone

**Check 1**: Server listening on 0.0.0.0?
```powershell
netstat -an | findstr "3000"
# Should show: 0.0.0.0:3000
```

**Check 2**: Firewall rule exists?
```powershell
Get-NetFirewallRule -DisplayName "MCP Server ZeroTier"
```

**Check 3**: ZeroTier connected?
```powershell
# Check ZeroTier status
zerotier-cli listnetworks

# Ping from handphone to PC
ping 10.210.48.233
```

**Check 4**: Test from PC first
```powershell
curl http://10.210.48.233:3000/health
```

---

**Configuration updated with your actual ZeroTier IP!** 🎯  
**Ready to deploy!** ✅
