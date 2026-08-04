// Único punto de lectura de la bandera de simulación. Una variable ausente
// significa PRODUCCIÓN (pedidos reales), nunca demo: olvidarse de configurarla
// no puede terminar regalando acceso premium.
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';
