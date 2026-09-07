# Antigravity IDE Configuration Guide

Guide untuk configure Antigravity IDE to connect ke remote MCP server via ZeroTier.

## Prerequisites

- ✅ MCP server running di PC kantor
- ✅ ZeroTier network configured (both PC dan handphone)
- ✅ Know PC ZeroTier IP (e.g., `172.28.0.100`)

---

## Step 1: Locate MCP Configuration File

Antigravity IDE MCP configuration terletak di:

```
C:\Users\<USERNAME>\.gemini\config\mcp_config.json
```

Atau di global config directory:
```
%USERPROFILE%\.gemini\config\mcp_config.json
```

---

## Step 2: Create or Update mcp_config.json

### If File Doesn't Exist

Create file `mcp_config.json` di `C:\Users\PC\.gemini\config\`:

```json
{
  "mcpServers": {
    "antigravity-remote-zerotier": {
      "serverUrl": "http://10.210.48.233:3000/sse"
    }
  }
}
```

### If File Already Exists

Add new server entry ke existing `mcpServers` object:

```json
{
  "mcpServers": {
    "existing-server": {
      "command": "...",
      "args": ["..."]
    },
    "antigravity-remote-zerotier": {
      "serverUrl": "http://172.28.0.100:3000/sse"
    }
  }
}
```

---

## Step 3: Configuration Options

### Option A: No Authentication (Recommended with ZeroTier)

```json
{
  "mcpServers": {
    "antigravity-remote-zerotier": {
      "serverUrl": "http://172.28.0.100:3000/sse"
    }
  }
}
```

**When to use**: If MCP server running without `MCP_AUTH_TOKEN` in `.env`

---

### Option B: With Token Authentication

```json
{
  "mcpServers": {
    "antigravity-remote-zerotier": {
      "serverUrl": "http://172.28.0.100:3000/sse",
      "headers": {
        "Authorization": "Bearer your-actual-token-from-dotenv"
      }
    }
  }
}
```

**When to use**: If MCP server configured with `MCP_AUTH_TOKEN` in `.env`

**Important**: Replace `your-actual-token-from-dotenv` with actual token value from MCP server's `.env` file

---

## Step 4: Verify Configuration

### Check Syntax

Ensure JSON is valid:
- Proper comma placement
- Matching brackets
- No trailing commas

Use online JSON validator if needed: https://jsonlint.com/

---

### Full Configuration Example

```json
{
  "mcpServers": {
    "antigravity-remote-zerotier": {
      "serverUrl": "http://172.28.0.100:3000/sse",
      "description": "Remote MCP server via ZeroTier virtual network",
      "timeout": 30000
    }
  }
}
```

**Configuration Fields:**
- `serverUrl`: **Required** - SSE endpoint URL with ZeroTier IP
- `headers`: Optional - Authentication headers if needed
- `description`: Optional - Human-readable description
- `timeout`: Optional - Connection timeout in milliseconds (default: 30000)

---

## Step 5: Restart Antigravity IDE

Configuration changes require IDE restart:

1. **Close** Antigravity IDE completely
2. **Wait** 5 seconds
3. **Reopen** Antigravity IDE

Or use command line:
```bash
# Kill IDE process
taskkill /F /IM "Antigravity IDE.exe"

# Restart (adjust path as needed)
Start "C:\Program Files\Antigravity IDE\Antigravity IDE.exe"
```

---

## Step 6: Verify Connection

### Check MCP Servers List

In Antigravity IDE:
1. Open **Additional Options (...)** menu
2. Click **MCP Servers**
3. Should see `antigravity-remote-zerotier` in list
4. Status should show **Connected** or **OK**

---

### Test MCP Tool

Open chat in Antigravity IDE and try:

```
@antigravity-remote-zerotier echo "Hello from ZeroTier!"
```

Expected response:
```
Echo: Hello from ZeroTier!
```

Or try system info tool:
```
@antigravity-remote-zerotier system_info
```

Should return PC system information via ZeroTier connection.

---

## Troubleshooting

### Problem: Server Not Appearing in List

**Check 1**: JSON syntax valid?
```bash
# Validate with Node.js
node -e "console.log(JSON.parse(require('fs').readFileSync('C:/Users/PC/.gemini/config/mcp_config.json')))"
```

**Check 2**: File in correct location?
```bash
dir "C:\Users\PC\.gemini\config\mcp_config.json"
```

**Check 3**: IDE restarted?
- Must completely close and reopen IDE

---

### Problem: Connection Failed or Timeout

**Check 1**: MCP server running on PC?
```powershell
# Check if server process running
Get-Process node

# Test health endpoint
curl http://10.210.48.233:3000/health
```

**Check 2**: ZeroTier connected on client device?
```bash
# If testing from different PC
zerotier-cli listnetworks
# Status should show: OK
```

**Check 3**: Firewall blocking connection?
```powershell
# Check firewall rule
Get-NetFirewallRule -DisplayName "MCP Server ZeroTier"

# Test connectivity
Test-NetConnection -ComputerName 172.28.0.100 -Port 3000
```

**Check 4**: Correct ZeroTier IP in config?
- Verify IP matches PC's actual ZeroTier IP
- Check in ZeroTier dashboard or via `ipconfig | Select-String "172.28"`

---

### Problem: Authentication Errors

**Error**: `401 Unauthorized`

**Solution 1**: Token mismatch
- Verify token in `mcp_config.json` matches `.env` file
- Check no extra spaces or line breaks in token

**Solution 2**: Remove authentication
- Either remove `headers` from `mcp_config.json`
- Or remove `MCP_AUTH_TOKEN` from server's `.env` and restart server

---

### Problem: Tools Not Working

**Check 1**: Server logs show errors?
- Check MCP server console output
- Look for error messages when tool called

**Check 2**: Tool name correct?
- Use exact tool names: `echo`, `system_info`, `execute_command`
- Case-sensitive

**Check 3**: MCP SDK version compatible?
- Ensure `@modelcontextprotocol/sdk` version matches between server and IDE

---

## Advanced Configuration

### Multiple Remote Servers

```json
{
  "mcpServers": {
    "office-pc-zerotier": {
      "serverUrl": "http://172.28.0.100:3000/sse",
      "description": "Office PC"
    },
    "home-pc-zerotier": {
      "serverUrl": "http://172.28.0.200:3000/sse",
      "description": "Home PC"
    }
  }
}
```

Each server appears separately in MCP servers list.

---

### Custom Timeout

For slow connections or long-running tools:

```json
{
  "mcpServers": {
    "antigravity-remote-zerotier": {
      "serverUrl": "http://172.28.0.100:3000/sse",
      "timeout": 60000
    }
  }
}
```

Timeout in milliseconds (60000 = 1 minute).

---

### HTTPS (Optional - Advanced)

If you setup SSL certificate on MCP server:

```json
{
  "mcpServers": {
    "antigravity-remote-zerotier": {
      "serverUrl": "https://172.28.0.100:3000/sse",
      "tls": {
        "rejectUnauthorized": false
      }
    }
  }
}
```

**Note**: With ZeroTier, HTTPS not necessary as traffic already encrypted.

---

## Testing Checklist

- [ ] `mcp_config.json` created with correct ZeroTier IP
- [ ] JSON syntax valid (no errors)
- [ ] Antigravity IDE restarted
- [ ] Server appears in MCP Servers list
- [ ] Server status shows "Connected" or "OK"
- [ ] Echo tool works: `@server echo "test"`
- [ ] System info tool works: `@server system_info`
- [ ] Can use tools in chat conversations

---

## Next Steps

1. **Use MCP Tools in IDE**:
   - Call tools via `@antigravity-remote-zerotier <tool-name>`
   - Integrate into your workflows

2. **Mobile Access**:
   - Install Antigravity mobile app (if available)
   - Configure same `mcp_config.json`
   - Access from anywhere via ZeroTier

3. **Monitoring**:
   - Check MCP server logs periodically
   - Monitor ZeroTier connection status
   - Review tool usage and performance

---

**Configuration Template Available**: `mcp_config.json.example` in project root

**Related Documentation**:
- [ZeroTier Setup Guide](./zerotier-setup-guide.md)
- [MCP Server README](./mcp-sse-server/README.md)
- [Implementation Plan](./implementation_plan.md)

**Created**: 2026-09-07  
**Version**: 1.0.0  
**Status**: Production Ready ✅
