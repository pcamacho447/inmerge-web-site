import { useState, useEffect, useRef } from 'react';
import useReducedMotion from '../hooks/useReducedMotion';

/**
 * parseMetric — Extracts prefix, number, suffix, and decimal count from strings like '+40%', '$1.2M', '99.98%'.
 */
export function parseMetric(str) {
  if (typeof str !== 'string') {
    return { prefix: '', number: typeof str === 'number' ? str : 0, suffix: '', decimals: 0 };
  }
  const match = str.trim().match(/^([^0-9.]*)(\d+(?:\.\d+)?)(.*)$/);
  if (!match) {
    return { prefix: '', number: 0, suffix: str, decimals: 0 };
  }
  const prefix = match[1] || '';
  const numStr = match[2] || '0';
  const suffix = match[3] || '';
  const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;
  const number = parseFloat(numStr) || 0;

  return { prefix, number, suffix, decimals };
}

/**
 * AnimatedNumber — Smooth metric counter with easeOutQuart interpolation.
 *
 * @param {Object} props
 * @param {string|number} props.value - Target metric string (e.g. "+40%", "18M", "99.98%")
 * @param {boolean} [props.trigger=true] - Triggers counting animation when true
 * @param {number} [props.duration=1200] - Duration in ms
 * @param {string} [props.className] - Optional CSS class
 */
export default function AnimatedNumber({ value, trigger = true, duration = 1200, className = '' }) {
  const prefersReducedMotion = useReducedMotion();
  const { prefix, number: targetNumber, suffix, decimals } = parseMetric(value);

  const [displayNumber, setDisplayNumber] = useState(() => (prefersReducedMotion ? targetNumber : 0));
  const rafRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayNumber(targetNumber);
      return;
    }

    if (!trigger) {
      return;
    }

    // Run animation when trigger flips to true
    let startTime = null;
    const startValue = 0;

    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);

      const current = startValue + (targetNumber - startValue) * easedProgress;
      setDisplayNumber(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDisplayNumber(targetNumber);
        rafRef.current = null;
      }
    };

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [trigger, targetNumber, duration, prefersReducedMotion]);

  const formattedNumber = prefersReducedMotion ? targetNumber.toFixed(decimals) : displayNumber.toFixed(decimals);

  return (
    <span className={`animated-metric-number ${className}`}>
      {prefix}
      {formattedNumber}
      {suffix}
    </span>
  );
}
