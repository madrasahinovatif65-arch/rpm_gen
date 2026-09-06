import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { exchangeCodeForToken, validateState, clearOAuthState } from '../lib/siakad-auth';
import { savePengaturan } from '../lib/firebase';
import type { Pengaturan } from '../types';

interface SiakadCallbackViewProps {
  onSuccess: () => void;
  config?: Pengaturan;
}

type CallbackState = 'processing' | 'success' | 'error';

export const SiakadCallbackView: React.FC<SiakadCallbackViewProps> = ({ onSuccess, config }) => {
  const [state, setState] = useState<CallbackState>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Parse URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const receivedState = urlParams.get('state');
        const error = urlParams.get('error');

        // Check for OAuth error response
        if (error) {
          throw new Error(`SIAKAD authorization failed: ${error}`);
        }

        // Validate required parameters
        if (!code) {
          throw new Error('Authorization code not found in callback URL');
        }

        if (!receivedState) {
          throw new Error('State parameter missing from callback');
        }

        // Validate CSRF state
        if (!validateState(receivedState)) {
          throw new Error('Invalid state parameter - possible security issue');
        }

        console.log('✅ OAuth callback validation passed');

        // Exchange code for access token
        const tokenResponse = await exchangeCodeForToken(code);

        console.log('✅ Token exchange successful:', {
          userId: tokenResponse.user.id,
          nama: tokenResponse.user.nama
        });

        // Save token and user info to localStorage
        const timestamp = Date.now();
        localStorage.setItem('edadmin_auth_token', tokenResponse.access_token);
        
        if (tokenResponse.refresh_token) {
          localStorage.setItem('edadmin_siakad_refresh', tokenResponse.refresh_token);
        }

        // Calculate token expiry
        const expiresAt = timestamp + (tokenResponse.expires_in * 1000);
        localStorage.setItem('edadmin_token_expires_at', expiresAt.toString());

        // Save user profile
        const userProfile = {
          username: tokenResponse.user.id,
          nama: tokenResponse.user.nama,
          nip: tokenResponse.user.nip || '',
          role: 'Guru',
          provider: 'siakad' as const,
          mataPelajaran: tokenResponse.user.mataPelajaran,
          sekolah: tokenResponse.user.sekolah
        };

        localStorage.setItem('edadmin_user', JSON.stringify(userProfile));

        // Sync user profile to Firestore + Phase 4: NIP-based account linking
        try {
          // Phase 4: Detect if existing local account matches SIAKAD profile by NIP
          let migrationMessage = '';
          
          if (config?.NIP_Guru && tokenResponse.user.nip) {
            // Compare NIP: remove spaces/dashes for flexible matching
            const existingNIP = config.NIP_Guru.replace(/[\s\-]/g, '');
            const siakadNIP = tokenResponse.user.nip.replace(/[\s\-]/g, '');
            
            if (existingNIP === siakadNIP && !config.siakadUserId) {
              // NIP match found! Account can be linked
              migrationMessage = `✅ Akun lokal "​${config.Nama_Guru}" berhasil terhubung dengan SIAKAD!`;
              console.log('🔗 Account linking detected - NIP match found');
            }
          }

          const updatedConfig: Pengaturan = {
            ...(config || {}),
            Nama_Guru: tokenResponse.user.nama,
            NIP_Guru: tokenResponse.user.nip || '',
            siakadUserId: tokenResponse.user.id,
            authProvider: 'siakad',
            siakadSyncedAt: Date.now()
          };

          await savePengaturan(updatedConfig);
          console.log('✅ User profile synced to Firestore');
          
          // Store migration message for display
          if (migrationMessage) {
            sessionStorage.setItem('siakad_migration_message', migrationMessage);
          }
        } catch (syncError) {
          console.warn('⚠️ Failed to sync profile to Firestore:', syncError);
          // Non-blocking: continue even if Firestore sync fails
        }

        // Success!
        setState('success');

        // Redirect to dashboard after brief delay
        setTimeout(() => {
          // Clean up URL (remove OAuth params)
          window.history.replaceState({}, document.title, '/');
          onSuccess();
        }, 1500);

      } catch (error: any) {
        console.error('❌ OAuth callback error:', error);
        setErrorMessage(error.message || 'Unknown error occurred');
        setState('error');
        clearOAuthState();
      }
    };

    handleCallback();
  }, [onSuccess, config]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4 transition-colors font-sans">
      {/* Background decorative blur */}
      <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] bg-emerald-500/10 dark:bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/10 dark:bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-6">
          
          {/* Processing State */}
          {state === 'processing' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Loader2 className="w-16 h-16 text-emerald-600 dark:text-emerald-400 animate-spin" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Memverifikasi Login Anda
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Sedang menukar authorization code dengan access token...
                </p>
              </div>
            </div>
          )}

          {/* Success State */}
          {state === 'success' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                  Login Berhasil!
                </h2>
                {/* Phase 4: Display migration message if account was linked */}
                {typeof window !== 'undefined' && sessionStorage.getItem('siakad_migration_message') && (
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-3 font-semibold bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded-lg">
                    {sessionStorage.getItem('siakad_migration_message')}
                  </p>
                )}
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Mengalihkan ke dashboard...
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {state === 'error' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-red-700 dark:text-red-400">
                  Login Gagal
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  {errorMessage}
                </p>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => {
                    window.location.href = '/';
                  }}
                  className="w-full px-4 py-3 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white rounded-xl font-semibold text-sm transition-colors"
                >
                  Kembali ke Login
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
