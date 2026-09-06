# Mock SIAKAD OAuth2 Server

Lightweight OAuth2-compatible mock server untuk development dan testing integrasi SSO SIAKAD tanpa dependency ke SIAKAD API real.

## Features

- ✅ OAuth2 Authorization Code Flow
- ✅ Login form UI yang user-friendly
- ✅ 3 mock guru test accounts
- ✅ One-time use authorization codes dengan expiry
- ✅ Mock JWT token generation
- ✅ Health check endpoint

## Prerequisites

- Node.js 18+ atau Bun
- npm atau bun package manager

## Installation

```bash
cd mock-siakad-server
npm install
```

## Running the Server

**Development mode** (dengan auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

Server akan berjalan di `http://localhost:3001`

## Mock Test Accounts

| ID Guru | PIN | Nama | NIP | Mata Pelajaran |
|---------|-----|------|-----|----------------|
| guru001 | 1234 | Budi Santoso, S.Pd. | 197805122005011003 | Matematika |
| guru002 | 5678 | Siti Aminah, M.Pd. | 198201152006042001 | Bahasa Indonesia |
| guru003 | 9999 | Drs. Yefri Haryanto, M.Pd. | 19850312 201001 1 008 | IPA |

## Testing SSO Flow

### 1. Start Mock SIAKAD Server

```bash
cd mock-siakad-server
npm run dev
```

Pastikan server berjalan di `http://localhost:3001`

### 2. Configure Main App

Di root project, edit `.env`:

```bash
VITE_SIAKAD_MOCK_MODE=true
VITE_SIAKAD_AUTH_URL=http://localhost:3001/oauth/authorize
VITE_SIAKAD_TOKEN_URL=http://localhost:3001/oauth/token
VITE_SIAKAD_CLIENT_ID=apk_gen_client
VITE_SIAKAD_REDIRECT_URI=http://localhost:5173/auth/callback
```

### 3. Start Main App

```bash
cd ..
npm run dev
```

### 4. Test Login Flow

1. Buka aplikasi di browser (`http://localhost:5173`)
2. Klik tombol **"Login dengan SIAKAD"**
3. Browser akan redirect ke mock SIAKAD login form
4. Gunakan salah satu test account di atas
5. Setelah login berhasil, akan redirect kembali ke aplikasi dengan token

## API Endpoints

### GET `/oauth/authorize`

Menampilkan form login SIAKAD.

**Query Parameters:**
- `client_id` (required): Client identifier
- `redirect_uri` (required): Callback URL setelah login
- `state` (optional): CSRF protection state

**Response:**
HTML login form dengan field ID Guru dan PIN.

---

### POST `/oauth/authorize`

Proses login credentials dan redirect ke callback dengan authorization code.

**Form Data:**
- `id`: ID Guru
- `pin`: PIN
- `client_id`: Client identifier
- `redirect_uri`: Callback URL
- `state`: CSRF protection state

**Success Response:**
```
HTTP 302 Redirect
Location: {redirect_uri}?code={auth_code}&state={state}
```

**Error Response:**
```
HTTP 401 Unauthorized
HTML error page dengan tombol "Coba Lagi"
```

---

### POST `/oauth/token`

Exchange authorization code untuk access token.

**Request Body (JSON):**
```json
{
  "grant_type": "authorization_code",
  "code": "mock_code_guru001_abc123",
  "client_id": "apk_gen_client"
}
```

**Success Response:**
```json
{
  "access_token": "mock_jwt_header.eyJzdWI...signature",
  "refresh_token": "refresh_guru001_1234567890",
  "expires_in": 3600,
  "token_type": "Bearer",
  "user": {
    "id": "guru001",
    "nama": "Budi Santoso, S.Pd.",
    "nip": "197805122005011003",
    "mataPelajaran": "Matematika",
    "sekolah": "SMP Negeri 3 Kerinci"
  }
}
```

**Error Responses:**
```json
// Invalid grant type
{
  "error": "unsupported_grant_type",
  "error_description": "Only authorization_code grant type is supported"
}

// Invalid or expired code
{
  "error": "invalid_grant",
  "error_description": "Authorization code is invalid or expired"
}
```

---

### GET `/health`

Health check endpoint untuk monitoring.

**Response:**
```json
{
  "status": "ok",
  "message": "Mock SIAKAD server is running",
  "timestamp": "2026-09-06T16:30:00.000Z"
}
```

## Configuration

### Port

Default port: `3001`

Untuk mengubah port, set environment variable:
```bash
PORT=3002 npm run dev
```

### Adding Mock Users

Edit `mock-data.ts` dan tambahkan entry baru di `mockUsers`:

```typescript
export const mockUsers: Record<string, any> = {
  'guru004': {
    id: 'guru004',
    pin: '1111',
    nama: 'Nama Guru Baru, S.Pd.',
    nip: '199001012015011001',
    mataPelajaran: 'Bahasa Inggris',
    sekolah: 'SMP Negeri 3 Kerinci'
  }
};
```

## Switching to Real SIAKAD

Ketika SIAKAD API real sudah ready:

1. Update `.env` di root project:
```bash
VITE_SIAKAD_MOCK_MODE=false
VITE_SIAKAD_AUTH_URL=https://siakad.example.com/oauth/authorize
VITE_SIAKAD_TOKEN_URL=https://siakad.example.com/oauth/token
VITE_SIAKAD_CLIENT_ID=<real_client_id>
VITE_SIAKAD_REDIRECT_URI=https://app.example.com/auth/callback
```

2. Restart main app
3. Mock server tidak perlu dijalankan lagi

## Security Notes

⚠️ **PENTING**: Mock server ini **HANYA untuk development dan testing**.

- Tidak ada enkripsi real pada JWT
- PIN disimpan plain-text di memory
- Tidak ada rate limiting
- Tidak ada HTTPS enforcement
- Authorization codes disimpan di memory (hilang saat restart)

**JANGAN deploy mock server ini ke production.**

## Troubleshooting

### Port Already in Use

```bash
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution**: Ubah port dengan `PORT=3002 npm run dev`

### CORS Errors

Jika aplikasi utama berjalan di port berbeda dan terjadi CORS error, mock server sudah include `cors()` middleware yang accept all origins untuk development.

### Authorization Code Expired

Authorization codes expire setelah 5 menit. Jika terlalu lama antara login dan token exchange, code akan invalid. Reload login form dan coba lagi.

## Development

File structure:
```
mock-siakad-server/
├── index.ts        # Main Express server
├── mock-data.ts    # User database & OAuth helpers
├── package.json    # Dependencies
└── README.md       # This file
```

## Support

Untuk pertanyaan atau issue terkait mock server, silakan diskusikan dengan development team atau buat ticket di project repository.
