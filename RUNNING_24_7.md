# AquaSense Backend - 24/7 Operation Guide

## Current Status

✅ **Server is running 24/7 with auto-restart on crash**

The backend is managed by `forever-runner.js`, which:
- Keeps the Node.js server running continuously
- Automatically restarts if the process crashes
- Logs all output to `logs/server.log`
- Logs all errors to `logs/error.log`
- Restarts with 5-second delay after crash

---

## Running the Server

### Start 24/7 Operation
```bash
npm run forever
```

### Start in Background (Windows PowerShell)
```powershell
# Run and detach from terminal
Start-Process "npm" -ArgumentList "run forever" -NoNewWindow -RedirectStandardOutput "logs/output.log" -RedirectStandardError "logs/error.log"
```

### Start for Development
```bash
npm run dev      # With auto-reload on file changes
npm start        # Single run
```

---

## Monitoring

### View Real-Time Logs
```bash
# All logs
tail -f logs/server.log

# Only errors
tail -f logs/error.log

# Last 50 lines
tail -50 logs/server.log
```

### Check Server Status
```bash
# Test if running
curl http://localhost:5000/api/auth/login

# Check if port 5000 is in use (PowerShell)
netstat -ano | findstr :5000
```

---

## Stop & Restart

### Kill Running Process (PowerShell)
```powershell
# Find and kill the forever-runner process
Get-Process node | Stop-Process -Force

# Or find specific PID using port
$pid = (netstat -ano | findstr :5000).Split()[-1]
taskkill /PID $pid /F
```

### Manual Restart
```bash
# Kill all node processes
pkill -9 node      # Linux/macOS
taskkill /F /IM node.exe  # Windows

# Restart
npm run forever
```

---

## Files

| File | Purpose |
|------|---------|
| `forever-runner.js` | Auto-restart manager script |
| `ecosystem.config.js` | PM2 configuration (for future use) |
| `logs/server.log` | Server output logs |
| `logs/error.log` | Server error logs |

---

## Configuration

Edit `forever-runner.js` to customize:
- **Restart delay**: Change `setTimeout(startServer, 5000)` (ms)
- **Log location**: Modify `logsDir` path
- **Memory limits**: Add process monitoring

---

## For Windows Task Scheduler (Optional 24/7 Persistence)

1. Open **Task Scheduler**
2. Create Basic Task → Name: "AquaSense Backend"
3. Trigger: "At startup" or "Daily at [time]"
4. Action:
   - Program: `C:\Program Files\nodejs\node.exe`
   - Arguments: `c:\Users\harsh\Documents\GitHub\backend\forever-runner.js`
   - Start in: `c:\Users\harsh\Documents\GitHub\backend`
5. Conditions: Check "Run whether user logged in or not"

---

## API Endpoints

Once running, access:
- **Auth**: `http://localhost:5000/api/auth`
- **Sensors**: `http://localhost:5000/api/sensors`
- **Zones**: `http://localhost:5000/api/zones`
- **Predictions**: `http://localhost:5000/api/predictions`

---

## Troubleshooting

**Server keeps crashing**: Check `logs/error.log` for startup errors
**Port already in use**: Kill existing process or change `PORT` in `server.js`
**Logs aren't updating**: Verify `logs/` directory exists and has write permissions

