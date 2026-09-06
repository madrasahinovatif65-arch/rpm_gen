import express from 'express';
import cors from 'cors';
import { mockUsers, generateAuthCode, validateCode, generateJWT } from './mock-data.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// OAuth2 /authorize endpoint (GET) - Display login form
app.get('/oauth/authorize', (req, res) => {
  const { client_id, redirect_uri, state } = req.query;
  
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mock SIAKAD Login</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            padding: 20px;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 400px;
            width: 100%;
          }
          h2 {
            margin: 0 0 24px 0;
            color: #1a202c;
            font-size: 24px;
            text-align: center;
          }
          .emoji {
            font-size: 48px;
            text-align: center;
            margin-bottom: 16px;
          }
          label {
            display: block;
            margin-bottom: 8px;
            color: #4a5568;
            font-weight: 600;
            font-size: 14px;
          }
          input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 16px;
            margin-bottom: 16px;
            box-sizing: border-box;
            transition: border-color 0.3s;
          }
          input:focus {
            outline: none;
            border-color: #667eea;
          }
          button {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
          }
          button:hover {
            transform: translateY(-2px);
          }
          button:active {
            transform: translateY(0);
          }
          .help {
            margin-top: 24px;
            padding: 16px;
            background: #f7fafc;
            border-radius: 8px;
            font-size: 13px;
            color: #718096;
          }
          .help strong {
            display: block;
            margin-bottom: 8px;
            color: #4a5568;
          }
          .user-list {
            margin: 8px 0 0 0;
            padding: 0;
            list-style: none;
          }
          .user-list li {
            padding: 4px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="emoji">🏫</div>
          <h2>Mock SIAKAD Login</h2>
          <form method="POST" action="/oauth/authorize">
            <input type="hidden" name="client_id" value="${client_id}" />
            <input type="hidden" name="redirect_uri" value="${redirect_uri}" />
            <input type="hidden" name="state" value="${state}" />
            
            <label for="id">ID Guru</label>
            <input 
              type="text" 
              id="id"
              name="id" 
              placeholder="Masukkan ID Guru" 
              required 
              autocomplete="username"
            />
            
            <label for="pin">PIN</label>
            <input 
              type="password" 
              id="pin"
              name="pin" 
              placeholder="Masukkan PIN" 
              required 
              autocomplete="current-password"
            />
            
            <button type="submit">Login</button>
          </form>
          
          <div class="help">
            <strong>Mock Test Accounts:</strong>
            <ul class="user-list">
              <li>👤 guru001 / PIN: 1234</li>
              <li>👤 guru002 / PIN: 5678</li>
              <li>👤 guru003 / PIN: 9999</li>
            </ul>
          </div>
        </div>
      </body>
    </html>
  `);
});

// OAuth2 /authorize endpoint (POST) - Process login
app.post('/oauth/authorize', (req, res) => {
  const { id, pin, redirect_uri, state } = req.body;
  
  if (mockUsers[id] && mockUsers[id].pin === pin) {
    const code = generateAuthCode(id);
    const redirectUrl = `${redirect_uri}?code=${code}&state=${state || ''}`;
    res.redirect(redirectUrl);
  } else {
    res.status(401).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Login Failed</title>
          <style>
            body {
              font-family: sans-serif;
              text-align: center;
              padding: 50px;
              background: #fee;
            }
            h1 { color: #c00; }
            a {
              display: inline-block;
              margin-top: 20px;
              padding: 10px 20px;
              background: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 8px;
            }
          </style>
        </head>
        <body>
          <h1>❌ Login Gagal</h1>
          <p>ID Guru atau PIN yang Anda masukkan tidak valid.</p>
          <a href="/oauth/authorize?${new URLSearchParams(req.query as any)}">Coba Lagi</a>
        </body>
      </html>
    `);
  }
});

// OAuth2 /token endpoint - Exchange authorization code for access token
app.post('/oauth/token', (req, res) => {
  const { code, grant_type, client_id } = req.body;
  
  if (grant_type !== 'authorization_code') {
    return res.status(400).json({ 
      error: 'unsupported_grant_type',
      error_description: 'Only authorization_code grant type is supported'
    });
  }
  
  const userId = validateCode(code);
  if (!userId) {
    return res.status(401).json({ 
      error: 'invalid_grant',
      error_description: 'Authorization code is invalid or expired'
    });
  }
  
  const user = mockUsers[userId];
  const accessToken = generateJWT(user);
  
  res.json({
    access_token: accessToken,
    refresh_token: `refresh_${userId}_${Date.now()}`,
    expires_in: 3600,
    token_type: 'Bearer',
    user: {
      id: user.id,
      nama: user.nama,
      nip: user.nip,
      mataPelajaran: user.mataPelajaran,
      sekolah: user.sekolah
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Mock SIAKAD server is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('');
  console.log('🎭 ================================================');
  console.log('   Mock SIAKAD OAuth2 Server');
  console.log('================================================');
  console.log('');
  console.log(`✅ Server running on: http://localhost:${PORT}`);
  console.log('');
  console.log('📋 Available endpoints:');
  console.log(`   GET  /oauth/authorize - Login form`);
  console.log(`   POST /oauth/authorize - Process login`);
  console.log(`   POST /oauth/token     - Exchange code for token`);
  console.log(`   GET  /health          - Health check`);
  console.log('');
  console.log('👥 Mock test accounts:');
  Object.entries(mockUsers).forEach(([id, user]) => {
    console.log(`   ${id} / PIN: ${user.pin} - ${user.nama}`);
  });
  console.log('');
  console.log('================================================');
});
