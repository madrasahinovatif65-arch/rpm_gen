// Mock guru user database
export const mockUsers: Record<string, any> = {
  'guru001': {
    id: 'guru001',
    pin: '1234',
    nama: 'Budi Santoso, S.Pd.',
    nip: '197805122005011003',
    mataPelajaran: 'Matematika',
    sekolah: 'SMP Negeri 3 Kerinci'
  },
  'guru002': {
    id: 'guru002',
    pin: '5678',
    nama: 'Siti Aminah, M.Pd.',
    nip: '198201152006042001',
    mataPelajaran: 'Bahasa Indonesia',
    sekolah: 'SMP Negeri 3 Kerinci'
  },
  'guru003': {
    id: 'guru003',
    pin: '9999',
    nama: 'Drs. Yefri Haryanto, M.Pd.',
    nip: '19850312 201001 1 008',
    mataPelajaran: 'IPA',
    sekolah: 'SMP Negeri 3 Kerinci'
  }
};

// In-memory storage for authorization codes
const authCodes = new Map<string, { userId: string; expiresAt: number }>();

// Generate one-time authorization code
export function generateAuthCode(userId: string): string {
  const code = `mock_code_${userId}_${Math.random().toString(36).substr(2, 9)}`;
  authCodes.set(code, {
    userId,
    expiresAt: Date.now() + 300000 // 5 minutes expiry
  });
  return code;
}

// Validate and consume authorization code
export function validateCode(code: string): string | null {
  const data = authCodes.get(code);
  if (!data || data.expiresAt < Date.now()) {
    return null;
  }
  authCodes.delete(code); // One-time use only
  return data.userId;
}

// Generate mock JWT token
export function generateJWT(user: any): string {
  // Simple mock JWT (not real cryptography, just for development)
  const payload = {
    sub: user.id,
    name: user.nama,
    nip: user.nip,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiry
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
  return `mock_jwt_header.${encodedPayload}.mock_signature`;
}
