/**
 * Migration script: Move localStorage kbc_cache_* to Firestore
 * Runs once on app initialization
 */

import { saveGeneratedDoc } from "../perangkatKbcStorage";

interface MigrationResult {
  success: number;
  failed: number;
  skipped: number;
}

/**
 * Migrate all kbc_cache_* items from localStorage to Firestore
 */
export async function migrateKbcCacheToFirestore(): Promise<MigrationResult> {
  const result: MigrationResult = { success: 0, failed: 0, skipped: 0 };
  
  // Check if migration already done
  const migrationFlag = localStorage.getItem('kbc_migration_done');
  if (migrationFlag === 'true') {
    console.log('Migration already completed, skipping');
    return result;
  }

  // Get user info
  const userStr = localStorage.getItem('edadmin_user');
  const user = userStr ? JSON.parse(userStr) : {};
  const username = user.username || user.nama || 'anonim';

  // Find all kbc_cache_* keys
  const cacheKeys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('kbc_cache_')) {
      cacheKeys.push(key);
    }
  }

  if (cacheKeys.length === 0) {
    console.log('No cache items to migrate');
    localStorage.setItem('kbc_migration_done', 'true');
    return result;
  }

  console.log(`Found ${cacheKeys.length} cached documents to migrate`);

  // Migrate each cached item
  for (const key of cacheKeys) {
    try {
      const rawData = localStorage.getItem(key);
      if (!rawData) {
        result.skipped++;
        continue;
      }

      const data = JSON.parse(rawData);
      const docType = key.replace('kbc_cache_', '');

      // Generate minimal formData from cached data (best effort)
      const formData = {
        schoolName: data.schoolName || data.namaSekolah || 'Sekolah',
        subject: data.subject || data.mataPelajaran || 'Umum',
        namaSekolah: data.schoolName || data.namaSekolah || 'Sekolah',
        mataPelajaran: data.subject || data.mataPelajaran || 'Umum'
      };

      await saveGeneratedDoc(docType, data, formData, username);
      
      // Remove from localStorage after successful migration
      localStorage.removeItem(key);
      result.success++;
      
    } catch (err) {
      console.warn(`Failed to migrate ${key}:`, err);
      result.failed++;
    }
  }

  // Mark migration as done
  localStorage.setItem('kbc_migration_done', 'true');
  
  console.log(`Migration complete: ${result.success} success, ${result.failed} failed, ${result.skipped} skipped`);
  
  return result;
}

/**
 * Reset migration flag (for testing)
 */
export function resetMigrationFlag() {
  localStorage.removeItem('kbc_migration_done');
}
