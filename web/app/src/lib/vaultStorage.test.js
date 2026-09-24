import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  BUCKET_NAME,
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
  sanitizeVaultFilePath,
  validateDeliverableFile,
  getSignedDeliverableUrl,
  uploadDeliverableToVault,
} from './vaultStorage.js';
import { supabase } from './supabaseClient.js';

vi.mock('./supabaseClient.js', () => ({
  supabase: {
    storage: {
      from: vi.fn(),
    },
  },
}));

describe('vaultStorage.js — Gestor de Almacenamiento Seguro Vault & Enlaces Firmados', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Constantes de configuración', () => {
    it('define el nombre del bucket correcto y límites de tamaño', () => {
      expect(BUCKET_NAME).toBe('project-deliverables-vault');
      expect(MAX_FILE_SIZE).toBe(52428800); // 50 MB
      expect(ALLOWED_MIME_TYPES).toContain('application/pdf');
      expect(ALLOWED_MIME_TYPES).toContain('application/json');
      expect(ALLOWED_MIME_TYPES).toContain('image/png');
      expect(ALLOWED_MIME_TYPES).toContain('image/jpeg');
      expect(ALLOWED_MIME_TYPES).toContain('application/zip');
      expect(ALLOWED_MIME_TYPES).toContain('text/markdown');
    });
  });

  describe('sanitizeVaultFilePath', () => {
    it('normaliza las rutas de archivos dentro del bucket eliminando caracteres especiales y espacios', () => {
      const path = sanitizeVaultFilePath('proj-123', 'Informe Técnico (v1 & final).pdf');
      expect(path).toContain('proj-123/');
      expect(path).not.toContain('(');
      expect(path).not.toContain(')');
      expect(path).not.toContain('&');
      expect(path).not.toContain(' ');
      expect(path).toContain('.pdf');
      expect(path).toMatch(/^proj-123\/\d+_[a-z0-9._-]+$/);
    });

    it('asigna un identificador por defecto si projectId no es proporcionado', () => {
      const path = sanitizeVaultFilePath(null, 'reporte.json');
      expect(path).toMatch(/^general\/\d+_reporte\.json$/);
    });

    it('convierte mayúsculas a minúsculas y colapsa guiones bajos consecutivos', () => {
      const path = sanitizeVaultFilePath('PROJ_A', 'AUDIT___REPORT 2026.PDF');
      expect(path).toContain('proj_a/');
      expect(path).toContain('audit_report_2026.pdf');
      expect(path).not.toContain('___');
    });
  });

  describe('validateDeliverableFile', () => {
    it('retorna error si el archivo es nulo o indefinido', () => {
      const resultNull = validateDeliverableFile(null);
      expect(resultNull.valid).toBe(false);
      expect(resultNull.error).toBe('No se ha seleccionado ningún archivo.');

      const resultUndefined = validateDeliverableFile(undefined);
      expect(resultUndefined.valid).toBe(false);
      expect(resultUndefined.error).toBe('No se ha seleccionado ningún archivo.');
    });

    it('retorna error si el archivo supera el límite de 50 MB', () => {
      const bigFile = {
        name: 'database-dump.zip',
        size: 52428801, // 50MB + 1 byte
        type: 'application/zip',
      };
      const result = validateDeliverableFile(bigFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('supera el límite máximo permitido de 50 MB');
    });

    it('valida exitosamente archivos con tipos MIME permitidos y tamaño adecuado', () => {
      const validPdf = new File(['%PDF-1.4 test'], 'auditoria.pdf', { type: 'application/pdf' });
      const validJson = new File(['{"status":"ok"}'], 'data.json', { type: 'application/json' });
      const validPng = new File(['png-data'], 'screenshot.png', { type: 'image/png' });

      expect(validateDeliverableFile(validPdf)).toEqual({ valid: true, error: null });
      expect(validateDeliverableFile(validJson)).toEqual({ valid: true, error: null });
      expect(validateDeliverableFile(validPng)).toEqual({ valid: true, error: null });
    });

    it('permite archivos con extensiones válidas si el tipo MIME no está definido en el navegador', () => {
      const fileWithoutMime = {
        name: 'especificacion.md',
        size: 1024,
        type: '',
      };
      const result = validateDeliverableFile(fileWithoutMime);
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('rechaza archivos ejecutables o con tipos no autorizados', () => {
      const invalidExe = {
        name: 'malware.exe',
        size: 2048,
        type: 'application/x-msdownload',
      };
      const result = validateDeliverableFile(invalidExe);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Formato de archivo no permitido');
    });
  });

  describe('getSignedDeliverableUrl', () => {
    it('retorna URL vacía si no se proporciona filePath', async () => {
      const res = await getSignedDeliverableUrl('');
      expect(res).toEqual({ signedUrl: '', expiresAt: null });
      expect(supabase.storage.from).not.toHaveBeenCalled();
    });

    it('genera URL firmada temporal con tiempo de expiración predeterminado de 900s', async () => {
      const mockSignedUrl = 'https://supabase.co/storage/v1/object/sign/project-deliverables-vault/p1/doc.pdf?token=abc';
      const createSignedUrlMock = vi.fn().mockResolvedValue({
        data: { signedUrl: mockSignedUrl },
        error: null,
      });

      supabase.storage.from.mockReturnValue({
        createSignedUrl: createSignedUrlMock,
      });

      const res = await getSignedDeliverableUrl('p1/doc.pdf');

      expect(supabase.storage.from).toHaveBeenCalledWith('project-deliverables-vault');
      expect(createSignedUrlMock).toHaveBeenCalledWith('p1/doc.pdf', 900);
      expect(res.signedUrl).toBe(mockSignedUrl);
      expect(typeof res.expiresAt).toBe('string');
      expect(new Date(res.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });

    it('permite especificar un tiempo de expiración personalizado', async () => {
      const mockSignedUrl = 'https://supabase.co/storage/v1/object/sign/p1/doc.pdf?token=xyz';
      const createSignedUrlMock = vi.fn().mockResolvedValue({
        data: { signedUrl: mockSignedUrl },
        error: null,
      });

      supabase.storage.from.mockReturnValue({
        createSignedUrl: createSignedUrlMock,
      });

      const res = await getSignedDeliverableUrl('p1/doc.pdf', { expiresInSeconds: 1800 });

      expect(createSignedUrlMock).toHaveBeenCalledWith('p1/doc.pdf', 1800);
      expect(res.signedUrl).toBe(mockSignedUrl);
    });

    it('aplica fallback resiliente si Supabase Storage falla', async () => {
      const createSignedUrlMock = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Bucket not found' },
      });

      supabase.storage.from.mockReturnValue({
        createSignedUrl: createSignedUrlMock,
      });

      const res = await getSignedDeliverableUrl('p1/informe-seguridad.pdf', { expiresInSeconds: 600 });

      expect(res.signedUrl).toBe('#download-p1%2Finforme-seguridad.pdf');
      expect(res.expiresAt).toBeDefined();
    });

    it('aplica fallback resiliente si ocurre una excepción de red', async () => {
      supabase.storage.from.mockImplementation(() => {
        throw new Error('Network timeout');
      });

      const res = await getSignedDeliverableUrl('p1/informe-seguridad.pdf');
      expect(res.signedUrl).toContain('#download-p1');
      expect(res.expiresAt).toBeDefined();
    });
  });

  describe('uploadDeliverableToVault', () => {
    it('lanza un error si el archivo no pasa la validación', async () => {
      const invalidFile = { name: 'script.sh', size: 100, type: 'application/x-sh' };
      await expect(uploadDeliverableToVault(invalidFile, { projectId: 'p1' })).rejects.toThrow(/Formato de archivo no permitido/);
    });

    it('sube un archivo válido a Supabase Storage con ruta sanitizada', async () => {
      const validFile = new File(['document content'], 'Informe (Final).pdf', { type: 'application/pdf' });
      const mockStoragePath = 'p1/1700000000000_informe_final.pdf';

      const uploadMock = vi.fn().mockResolvedValue({
        data: { path: mockStoragePath },
        error: null,
      });

      supabase.storage.from.mockReturnValue({
        upload: uploadMock,
      });

      const result = await uploadDeliverableToVault(validFile, { projectId: 'p1' });

      expect(supabase.storage.from).toHaveBeenCalledWith('project-deliverables-vault');
      expect(uploadMock).toHaveBeenCalledWith(expect.stringMatching(/^p1\/\d+_informe_final\.pdf$/), validFile, {
        cacheControl: '3600',
        upsert: true,
      });
      expect(result).toEqual({
        storagePath: mockStoragePath,
        fileName: 'Informe (Final).pdf',
        fileSize: validFile.size,
        mimeType: 'application/pdf',
      });
    });

    it('ofrece fallback local si Supabase Storage falla en la subida', async () => {
      const validFile = new File(['content'], 'report.json', { type: 'application/json' });
      const uploadMock = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Storage bucket offline' },
      });

      supabase.storage.from.mockReturnValue({
        upload: uploadMock,
      });

      const result = await uploadDeliverableToVault(validFile, { projectId: 'p2' });

      expect(result.storagePath).toMatch(/^p2\/\d+_report\.json$/);
      expect(result.fileName).toBe('report.json');
      expect(result.mimeType).toBe('application/json');
    });

    it('ofrece fallback local si ocurre una excepción durante la subida', async () => {
      const validFile = new File(['content'], 'report.json', { type: 'application/json' });
      supabase.storage.from.mockImplementation(() => {
        throw new Error('Upload error');
      });

      const result = await uploadDeliverableToVault(validFile, { projectId: 'p2' });
      expect(result.storagePath).toMatch(/^p2\/\d+_report\.json$/);
      expect(result.fileName).toBe('report.json');
    });
  });
});
