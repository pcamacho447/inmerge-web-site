import { useState } from 'react';
import { getReportDownloadUrl } from '../lib/downloadReport.js';

// La Edge Function responde en inglés y con vocabulario de sistema. Quien lee
// esto ya tiene sesión, así que se traduce a algo accionable. El resto de
// mensajes se deja pasar tal cual: son casos raros y el texto original ayuda
// a depurar.
function mensajeDeDescarga(mensajeCrudo) {
  if (mensajeCrudo.includes('not available yet')) {
    return 'Este reporte todavía no tiene el archivo cargado. Escríbenos por WhatsApp y te lo enviamos.';
  }
  if (mensajeCrudo.includes('Not entitled')) {
    return 'Tu acceso a este reporte no está activo. Escríbenos por WhatsApp si crees que es un error.';
  }
  return mensajeCrudo;
}

// Estado y lógica de descarga compartidos entre /cuenta y /reportes — ambas
// páginas ofrecen el mismo botón "Descargar" sobre el mismo reporte, así que
// viven en un solo lugar en vez de dos copias divergiendo con el tiempo.
export default function useReportDownload() {
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState({ id: null, message: '' });

  async function handleDownload(reportId) {
    setDownloadError({ id: null, message: '' });
    setDownloadingId(reportId);
    try {
      const url = await getReportDownloadUrl(reportId);
      // Signed URL is short-lived (5 min) — open it now to start the download.
      window.open(url, '_blank', 'noopener');
    } catch (err) {
      setDownloadError({ id: reportId, message: mensajeDeDescarga(err.message) });
    } finally {
      setDownloadingId(null);
    }
  }

  return { downloadingId, downloadError, handleDownload };
}
