// Comprueba que una tipografía web REALMENTE se usó al pintar, no que el
// navegador crea que la tiene disponible.
//
// document.fonts.check() dice si hay una face REGISTRADA cuya carga sigue
// pendiente. Si la hoja de Google Fonts nunca llegó a cargar (host bloqueado,
// sin red, CDN caído), no se registra ninguna @font-face: no hay nada
// pendiente, y check() devuelve true por vacío, no por éxito. Una portada
// pintada en la serif del sistema pasa esa comprobación igual — check() no
// observa el resultado, solo el estado de un registro que nunca se llenó. Se
// probó a propósito bloqueando fonts.googleapis.com/fonts.gstatic.com: el
// título cae a la serif del sistema, document.fonts queda vacío, y
// document.fonts.check('700 64px Spectral') sigue devolviendo true.
//
// Este chequeo mide el efecto real: dibuja el mismo texto con la fuente
// esperada (con reserva a una familia neutra) y con esa reserva sola, y
// compara el ancho resultante en un <canvas>. Si la fuente cargó, el ancho
// difiere de la reserva porque las métricas son distintas; si no cargó, el
// navegador nunca tuvo más que la reserva y los dos anchos coinciden.
export async function fontRendered(page, family, { weight = 400, size = 64 } = {}) {
  // Por si la face sí está registrada pero todavía en camino: dar tiempo a
  // que termine de resolverse (o de fallar) antes de medir. No sustituye la
  // medición de abajo, solo evita medir a mitad de carga.
  await page.evaluate(() => document.fonts.ready).catch(() => {});

  return page.evaluate(
    ({ family, weight, size }) => {
      // Cadena con formas de glifo bien distintas (ascendentes, descendentes,
      // curvas, numerales) para que una diferencia de métricas entre fuentes
      // se note en el ancho total, no se cancele por promedio.
      const probe = 'AaBbGgQq0123456789';
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      ctx.font = `${weight} ${size}px monospace`;
      const fallbackWidth = ctx.measureText(probe).width;

      ctx.font = `${weight} ${size}px "${family}", monospace`;
      const targetWidth = ctx.measureText(probe).width;

      return Math.abs(targetWidth - fallbackWidth) > 1;
    },
    { family, weight, size },
  );
}
