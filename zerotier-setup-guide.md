# ZeroTier Virtual Network Setup Guide

Panduan lengkap untuk setup ZeroTier virtual network antara PC kantor dan handphone untuk remote access ke MCP Server.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Part 1: PC Kantor Setup (Windows)](#part-1-pc-kantor-setup-windows)
- [Part 2: Handphone Setup (Android/iOS)](#part-2-handphone-setup-androidios)
- [Part 3: Configure MCP Server](#part-3-configure-mcp-server)
- [Part 4: Testing Remote Access](#part-4-testing-remote-access)
- [Troubleshooting](#troubleshooting)
- [Auto-Start Configuration](#auto-start-configuration)
- [Security Best Practices](#security-best-practices)

---

## Prerequisites

- ✅ PC Windows (kantor) dengan MCP server sudah installed
- ✅ Handphone Android atau iOS
- ✅ Koneksi internet di kedua devices
- ✅ ZeroTier account (free) - buat di https://my.zerotier.com

---

## Part 1: PC Kantor Setup (Windows)

### Step 1: Install ZeroTier pada PC

#### Option A: MSI Installer (Recommended)

\`\`\`powershell
# Download ZeroTier MSI installer
Invoke-WebRequest -Uri "https://download.zerotier.com/dist/ZeroTier%20One.msi" -OutFile "$env:TEMP\ZeroTierOne.msi"

# Install (akan membuka installer GUI)
Start-Process msiexec.exe -ArgumentList "/i $env:TEMP\ZeroTierOne.msi" -Wait
\`\`\`

#### Option B: Manual Download

1. Download dari: https://www.zerotier.com/download/
2. Install **ZeroTier One** MSI package
3. ZeroTier akan run di system tray (taskbar kanan bawah) - look for ZT icon

---

### Step 2: Create ZeroTier Network

1. **Login** ke https://my.zerotier.com
2. Klik **"Create A Network"**
3. **Copy Network ID** (format: `1234567890abcdef` - 16 hex characters)
4. Klik network name untuk configure:
   - **Name**: `Antigravity-Remote-MCP` (or your preferred name)
   - **Access Control**: **Private** (devices perlu approval untuk join)
   - **IPv4 Auto-Assign**: **Enabled** 
     - Default range: `172.28.0.0/16` (good for up to 65k devices)
   - **IPv6 Auto-Assign**: Optional (can leave enabled)

> [!TIP]
> **Private mode** is recommended! Devices must be manually authorized, preventing unauthorized access.

---

### Step 3: Join Network dari PC

#### Via GUI (Easiest):

1. Klik **ZeroTier icon** di system tray (taskbar kanan bawah)
2. Klik **"Join Network..."**
3. **Paste Network ID** (dari Step 2)
4. Klik **"Join"**

#### Via Command Line:

\`\`\`powershell
# Join network
zerotier-cli join 1234567890abcdef

# Check status
zerotier-cli listnetworks
\`\`\`

---

### Step 4: Authorize PC di Web Console

1. Kembali ke https://my.zerotier.com
2. Pilih network Anda (`Antigravity-Remote-MCP`)
3. Scroll ke **"Members"** section
4. Akan ada **1 device pending** (PC Anda)
   - Shows device ID, IP address, and last seen timestamp
5. **Check ✓** checkbox di kolom **"Auth?"** untuk authorize
6. **Note Managed IP** yang assigned (e.g., `172.28.0.100`)

> [!IMPORTANT]
> **Save this IP address!** You'll need it to access MCP server from handphone.

---

### Step 5: Verify PC Connection

\`\`\`powershell
# Check ZeroTier service status
zerotier-cli info
# Expected output: 200 info <node-id> <version> ONLINE

# Check network list
zerotier-cli listnetworks
# Should show your network with status OK

# Check assigned IP
ipconfig | Select-String "172.28"
# Should show your ZeroTier adapter with assigned IP

# Test ping to self
ping 172.28.0.100
# Should receive replies
\`\`\`

✅ **If ping successful**: PC setup complete!

---

## Part 2: Handphone Setup (Android/iOS)

### Step 1: Install ZeroTier Mobile App

#### Android:
- **Google Play Store**: https://play.google.com/store/apps/details?id=com.zerotier.one
- Or search **"ZeroTier One"**
- Install and open app

#### iOS:
- **App Store**: https://apps.apple.com/app/zerotier-one/id1084101492
- Or search **"ZeroTier One"**
- Install and open app

---

### Step 2: Join Network from Handphone

1. Open **ZeroTier One** app
2. Tap **"+"** button (Add Network)
3. **Enter Network ID** (same as Step 2 Part 1: `1234567890abcdef`)
4. Tap **"Add Network"** or **"Join"**
5. Network appears in list with status **"REQUESTING_CONFIGURATION"** or similar

---

### Step 3: Authorize Handphone

1. Kembali ke https://my.zerotier.com (di browser PC/laptop)
2. **Refresh page** (F5)
3. Di **"Members"** section, akan ada **2 devices** sekarang:
   - **Device 1**: PC (already authorized ✓)
   - **Device 2**: Handphone (pending)
4. **Check ✓** checkbox untuk authorize handphone
5. **Note Managed IP** handphone (e.g., `172.28.0.150`)

> [!TIP]
> Give devices recognizable names in ZeroTier dashboard for easier management: Click device description and edit.

---

### Step 4: Verify Handphone Connection

**In ZeroTier app:**
1. Network status should show **"OK"** (green indicator)
2. Check assigned IP below network name
3. If status stuck on "REQUESTING": refresh or rejoin network

**Test connectivity:**

**Option A: Using Network Tools App**
1. Install **"Ping Tools"** atau **"Network Analyzer"** from app store
2. Ping PC ZeroTier IP: `172.28.0.100`
3. Should receive replies

**Option B: Using Browser**
1. Open browser (Chrome/Safari)
2. Navigate to: `http://172.28.0.100:3000/health`
3. Should see JSON response (if MCP server running)

✅ **If successful**: Handphone setup complete! Devices can communicate via ZeroTier.

---

## Part 3: Configure MCP Server

### Update MCP Server to Listen on ZeroTier Interface

The MCP server in `mcp-sse-server/index.js` is already configured to listen on `0.0.0.0` (all interfaces), which includes ZeroTier.

**Verify** the configuration (should already be set):

\`\`\`javascript
// In index.js (line ~280)
app.listen(PORT, '0.0.0.0', () => {
  // ...
});
\`\`\`

> [!NOTE]
> **`0.0.0.0`** means "listen on ALL network interfaces":
> - localhost (127.0.0.1)
> - WiFi/Ethernet
> - **ZeroTier virtual adapter**

---

### Windows Firewall Configuration

Allow MCP server port (3000) through Windows Firewall:

\`\`\`powershell
# Create inbound firewall rule
New-NetFirewallRule `
  -DisplayName "MCP Server ZeroTier" `
  -Direction Inbound `
  -LocalPort 3000 `
  -Protocol TCP `
  -Action Allow `
  -Profile Any

# Verify rule was created
Get-NetFirewallRule -DisplayName "MCP Server ZeroTier"
\`\`\`

> [!WARNING]
> **Firewall is critical!** Without this rule, handphone cannot connect even though ZeroTier network is working.

---

### Create .env Configuration

\`\`\`bash
# In mcp-sse-server directory
cd E:\OneDrive\apk_gen\mcp-sse-server

# Copy template
copy .env.example .env

# Edit .env with notepad
notepad .env
\`\`\`

**Recommended configuration for ZeroTier:**

\`\`\`env
MCP_PORT=3000

# Option 1: No auth (rely on ZeroTier network isolation) - RECOMMENDED
MCP_AUTH_TOKEN=

# Option 2: With auth (extra security layer)
# MCP_AUTH_TOKEN=<generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">

ALLOWED_ORIGINS=*
\`\`\`

---

## Part 4: Testing Remote Access

### Test 1: Local PC Testing

\`\`\`powershell
# Navigate to MCP server directory
cd E:\OneDrive\apk_gen\mcp-sse-server

# Start server
npm start
\`\`\`

**Expected output:**
```
🚀 ============================================
🚀 MCP SSE Server Started Successfully!
🚀 ============================================

📡 Local access:     http://localhost:3000
📡 Network access:   http://0.0.0.0:3000
📡 SSE endpoint:     http://0.0.0.0:3000/sse
📡 Health check:     http://0.0.0.0:3000/health

🔒 Authentication:   DISABLED (ZeroTier isolation)
⚡ Rate limit:       100 requests per 60 seconds

✅ Server is ready to accept connections!
```

**Test health endpoint:**
\`\`\`powershell
curl http://localhost:3000/health
\`\`\`

**Expected response:**
\`\`\`json
{
  "status": "ok",
  "timestamp": "2026-09-07T09:00:00.000Z",
  "version": "1.0.0",
  "server": "antigravity-remote-mcp",
  "authEnabled": false,
  "transport": "SSE"
}
\`\`\`

---

### Test 2: PC via ZeroTier IP

\`\`\`powershell
# Test via ZeroTier IP (use your actual IP from Step 4 Part 1)
curl http://172.28.0.100:3000/health
\`\`\`

Should get same JSON response. ✅

---

### Test 3: Handphone via Browser

1. Open browser on handphone (Chrome/Safari)
2. Navigate to: `http://172.28.0.100:3000/health` (use PC's ZeroTier IP)
3. Should see JSON response

✅ **Success!** Remote access working via ZeroTier.

---

### Test 4: Handphone via HTTP Client App

**Install HTTP Client:**
- Android: **"HTTP Request Maker"** or **"HTTP Shortcuts"**
- iOS: **"HTTP Client"** or use Shortcuts app

**Create GET request:**
- URL: `http://172.28.0.100:3000/health`
- Method: GET
- Headers: (none needed if no auth)

**Send request** → Should get JSON response.

---

### Test 5: MCP SSE Connection (from Antigravity IDE)

Will be configured in Phase 3 - IDE Configuration.

---

## Troubleshooting

### Problem 1: Cannot ping between devices

**Check 1: ZeroTier Status**
\`\`\`powershell
# On PC
zerotier-cli info
zerotier-cli listnetworks

# Should show: 200 info <node-id> <version> ONLINE
# Network status should be: OK
\`\`\`

**Check 2: Both Devices Authorized**
- Go to https://my.zerotier.com
- Check both devices have ✓ in "Auth?" column
- Both should show "ONLINE" status

**Check 3: Network Configuration**
- IPv4 Auto-Assign should be **Enabled**
- Check managed routes (should have default route for 172.28.0.0/16)

**Solution: Restart ZeroTier**
\`\`\`powershell
# On PC
Restart-Service ZeroTierOneService

# On handphone: Force close and reopen ZeroTier app
\`\`\`

---

### Problem 2: Handphone cannot access MCP server

**Check 1: MCP Server Listening on 0.0.0.0?**
\`\`\`powershell
netstat -an | findstr "3000"

# Should show: 0.0.0.0:3000 (not 127.0.0.1:3000)
# If shows 127.0.0.1:3000 → Server only listening on localhost!
\`\`\`

**Check 2: Firewall Rule Exists?**
\`\`\`powershell
Get-NetFirewallRule -DisplayName "MCP Server ZeroTier"

# If not found → Create firewall rule (see Part 3)
\`\`\`

**Check 3: MCP Server Running?**
\`\`\`powershell
# Check if node process running
Get-Process node

# If not running → Start server: npm start
\`\`\`

**Check 4: Test from PC First**
\`\`\`powershell
curl http://172.28.0.100:3000/health

# If this fails → Problem with server or firewall
# If this works but handphone fails → Problem with ZeroTier connection
\`\`\`

**Solution: Temporarily Disable Firewall for Testing**
\`\`\`powershell
# Disable (test only!)
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False

# Test from handphone

# Re-enable
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True

# If it worked → Firewall rule is the issue, recreate it
\`\`\`

---

### Problem 3: ZeroTier shows "ACCESS_DENIED"

**Cause**: Device not authorized in network

**Solution**:
1. Go to https://my.zerotier.com
2. Find your network
3. Locate device in Members section
4. Check ✓ the "Auth?" checkbox
5. Wait 10-30 seconds for update
6. Refresh ZeroTier app on device

---

### Problem 4: High Latency or Slow Connection

**Check: Connection Type**
\`\`\`powershell
# On PC
zerotier-cli listpeers

# Look for handphone's node ID
# "paths" should show DIRECT or RELAY
# DIRECT = P2P (fast)
# RELAY = via ZeroTier relay server (slower)
\`\`\`

**Solutions**:
- **RELAY mode**: Normal if devices behind NAT/firewall. Still functional but higher latency (~50-200ms)
- **Improve to DIRECT**: Configure port forwarding (advanced), or use in same location temporarily

> [!NOTE]
> RELAY mode is perfectly fine for MCP server usage. Latency is still low enough for interactive use.

---

## Auto-Start Configuration

### PC: ZeroTier Auto-Start (Default)

ZeroTier automatically starts with Windows by default.

**Verify:**
\`\`\`powershell
Get-Service ZeroTierOneService

# Status should be: Running
# StartType should be: Automatic
\`\`\`

---

### PC: MCP Server Auto-Start

#### Option A: Windows Task Scheduler

\`\`\`powershell
# Create startup task
$action = New-ScheduledTaskAction `
  -Execute "node" `
  -Argument "E:\OneDrive\apk_gen\mcp-sse-server\index.js" `
  -WorkingDirectory "E:\OneDrive\apk_gen\mcp-sse-server"

$trigger = New-ScheduledTaskTrigger -AtStartup

$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable

Register-ScheduledTask `
  -TaskName "MCP-Server-Startup" `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -RunLevel Highest

# Verify
Get-ScheduledTask -TaskName "MCP-Server-Startup"
\`\`\`

#### Option B: PM2 Process Manager

\`\`\`bash
# Install PM2 globally
npm install -g pm2

# Navigate to server directory
cd E:\OneDrive\apk_gen\mcp-sse-server

# Start with PM2
pm2 start index.js --name mcp-server

# Save PM2 process list
pm2 save

# Setup auto-start (run as Administrator)
pm2 startup

# PM2 will generate a command to run - execute it
\`\`\`

#### Option C: NSSM (Non-Sucking Service Manager)

1. Download NSSM: https://nssm.cc/download
2. Extract to `C:\nssm\`
3. Install service:

\`\`\`powershell
# Run as Administrator
C:\nssm\nssm.exe install MCPServer "C:\Program Files\nodejs\node.exe" "E:\OneDrive\apk_gen\mcp-sse-server\index.js"

# Set working directory
C:\nssm\nssm.exe set MCPServer AppDirectory "E:\OneDrive\apk_gen\mcp-sse-server"

# Start service
C:\nssm\nssm.exe start MCPServer

# Verify
Get-Service MCPServer
\`\`\`

---

### Handphone: ZeroTier Auto-Start

**Android:**
- ZeroTier auto-starts by default
- Check: Settings → Apps → ZeroTier → Battery → Allow background activity

**iOS:**
- ZeroTier runs in background when enabled
- May need occasional refresh if network dormant for long time

---

## Security Best Practices

### ✅ Already Secure (via ZeroTier):

- ✅ **End-to-end encryption**: All traffic encrypted by ZeroTier
- ✅ **Private network**: Not exposed to public internet
- ✅ **Device authentication**: Only authorized devices can join
- ✅ **Network isolation**: Separate from your home/work WiFi

### 🔒 Optional Additional Security:

1. **Enable Token Auth** (if paranoid):
   ```env
   MCP_AUTH_TOKEN=<secure-random-token>
   ```

2. **Network Flow Rules** (Advanced):
   - Configure in ZeroTier dashboard
   - Restrict which devices can talk to which
   - Example: Only allow handphone → PC, not PC → handphone

3. **Regular Security Audit**:
   - Review authorized devices monthly
   - Remove old/unused devices
   - Check ZeroTier activity logs

4. **Device-level Security**:
   - Use screen lock on handphone
   - Enable device encryption
   - Keep ZeroTier app updated

---

## Summary Checklist

### ✅ PC Setup Complete When:
- [ ] ZeroTier installed and running
- [ ] Joined network and authorized
- [ ] Got ZeroTier IP (e.g., 172.28.0.100)
- [ ] Can ping self via ZeroTier IP
- [ ] MCP server listening on 0.0.0.0:3000
- [ ] Firewall rule created for port 3000
- [ ] Health endpoint responds: `curl http://172.28.0.100:3000/health`

### ✅ Handphone Setup Complete When:
- [ ] ZeroTier app installed
- [ ] Joined same network and authorized
- [ ] Got ZeroTier IP (e.g., 172.28.0.150)
- [ ] Can ping PC: `ping 172.28.0.100`
- [ ] Can access MCP health: `http://172.28.0.100:3000/health` in browser

### ✅ System Ready When:
- [ ] Both devices show "OK" status in ZeroTier
- [ ] Handphone can access MCP server from anywhere with internet
- [ ] MCP server auto-starts with PC (optional but recommended)

---

## Next Steps

1. **Configure Antigravity IDE** to connect to remote MCP server
   - See: [IDE Configuration Guide](./ide-configuration-guide.md)
   - Update `mcp_config.json` with ZeroTier IP

2. **Test MCP Tools** from IDE
   - Echo tool
   - System info tool
   - Command execution tool

3. **Optional: Create Web Interface**
   - See: `web-client/index.html` in mcp-sse-server
   - Test MCP connection from browser

---

**Created**: 2026-09-07  
**Version**: 1.0.0  
**Status**: Production Ready ✅

**Related Documentation**:
- [MCP Server README](./mcp-sse-server/README.md)
- [Implementation Plan](./implementation_plan.md)
- [Troubleshooting Guide](#troubleshooting)
