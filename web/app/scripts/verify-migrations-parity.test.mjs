import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rutas a ambos directorios de migraciones
const rootMigrationsDir = path.resolve(__dirname, '../../../supabase/migrations');
const webAppMigrationsDir = path.resolve(__dirname, '../supabase/migrations');

describe('Database & Migrations Parity Verification (Root vs web/app)', () => {
  it('both migrations directories exist and contain migrations', () => {
    expect(fs.existsSync(rootMigrationsDir)).toBe(true);
    expect(fs.existsSync(webAppMigrationsDir)).toBe(true);

    const rootFiles = fs.readdirSync(rootMigrationsDir).filter((f) => f.endsWith('.sql'));
    const webAppFiles = fs.readdirSync(webAppMigrationsDir).filter((f) => f.endsWith('.sql'));

    expect(rootFiles.length).toBeGreaterThanOrEqual(8);
    expect(webAppFiles.length).toBeGreaterThanOrEqual(8);
  });

  it('both directories contain the exact same list of migration files', () => {
    const rootFiles = fs.readdirSync(rootMigrationsDir).filter((f) => f.endsWith('.sql')).sort();
    const webAppFiles = fs.readdirSync(webAppMigrationsDir).filter((f) => f.endsWith('.sql')).sort();

    expect(rootFiles).toEqual(webAppFiles);
  });

  it('every migration file is identical byte-for-byte in both directories', () => {
    const rootFiles = fs.readdirSync(rootMigrationsDir).filter((f) => f.endsWith('.sql'));

    rootFiles.forEach((fileName) => {
      const rootContent = fs.readFileSync(path.join(rootMigrationsDir, fileName), 'utf8');
      const webAppContent = fs.readFileSync(path.join(webAppMigrationsDir, fileName), 'utf8');

      expect(rootContent, `Migration ${fileName} differs between root and web/app`).toBe(webAppContent);
    });
  });

  it('verifies critical architectural constraints in migrations', () => {
    // 0006: Rate limit trigger en leads_tdr
    const mig0006 = fs.readFileSync(path.join(rootMigrationsDir, '0006_inmerge_leads_rate_limiting.sql'), 'utf8');
    expect(mig0006).toContain('RATE_LIMIT_EXCEEDED');
    expect(mig0006).toContain('leads_tdr');

    // 0007: Bucket billing-vouchers con límite de 10MB y MIME types restringidos
    const mig0007 = fs.readFileSync(path.join(rootMigrationsDir, '0007_inmerge_backend_suite_enhancements.sql'), 'utf8');
    expect(mig0007).toContain('billing-vouchers');
    expect(mig0007).toContain('10485760'); // 10MB
    expect(mig0007).toContain('image/jpeg');
    expect(mig0007).toContain('application/pdf');

    // 0008: Asignación de consultor en hitos
    const mig0008 = fs.readFileSync(path.join(rootMigrationsDir, '0008_inmerge_milestone_assigned_staff.sql'), 'utf8');
    expect(mig0008).toContain('assigned_to_name');
    expect(mig0008).toContain('assigned_to_email');
    expect(mig0008).toContain('assigned_to_id');
  });
});
