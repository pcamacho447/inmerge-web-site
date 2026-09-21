import { useState, useEffect, useRef } from 'react';
import useReducedMotion from './useReducedMotion';

/**
 * useSpringValue — Lightweight in-house critical-damped physics spring hook.
 *
 * Simulates physical motion with mass-spring-damper equations via requestAnimationFrame.
 * Automatically settles and cancels the RAF loop when displacement and velocity reach epsilon.
 * Respects prefers-reduced-motion by bypassing physics and returning target immediately.
 *
 * @param {number} target - The target numeric value to animate toward
 * @param {Object} [config] - Physics parameters
 * @param {number} [config.stiffness=170] - Spring stiffness coefficient (k)
 * @param {number} [config.damping=26] - Viscous damping factor (c)
 * @param {number} [config.mass=1] - Mass (m)
 * @param {boolean} [config.enabled=true] - Toggle spring simulation
 * @returns {number} The current animated value
 */
export function useSpringValue(target, { stiffness = 170, damping = 26, mass = 1, enabled = true } = {}) {
  const prefersReducedMotion = useReducedMotion();
  const [currentValue, setCurrentValue] = useState(target);

  const valueRef = useRef(target);
  const velocityRef = useRef(0);
  const targetRef = useRef(target);
  const rafIdRef = useRef(null);
  const lastTimeRef = useRef(null);

  targetRef.current = target;

  useEffect(() => {
    if (prefersReducedMotion || !enabled) {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      valueRef.current = target;
      velocityRef.current = 0;
      setCurrentValue(target);
      return;
    }

    lastTimeRef.current = null;

    const tick = (now) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
        rafIdRef.current = requestAnimationFrame(tick);
        return;
      }

      // Clamp delta time to avoid physics explosion when returning from background tab
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.064);
      lastTimeRef.current = now;

      // Sub-stepping for smooth integration
      const steps = Math.max(1, Math.ceil(dt / 0.008));
      const subDt = dt / steps;

      for (let i = 0; i < steps; i++) {
        const displacement = valueRef.current - targetRef.current;
        const springForce = -stiffness * displacement;
        const dampingForce = -damping * velocityRef.current;
        const acceleration = (springForce + dampingForce) / mass;

        velocityRef.current += acceleration * subDt;
        valueRef.current += velocityRef.current * subDt;
      }

      if (Math.abs(valueRef.current - targetRef.current) < 0.1 && Math.abs(velocityRef.current) < 0.1) {
        valueRef.current = targetRef.current;
        velocityRef.current = 0;
        setCurrentValue(targetRef.current);
        rafIdRef.current = null;
        return;
      }

      setCurrentValue(valueRef.current);
      rafIdRef.current = requestAnimationFrame(tick);
    };

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [target, stiffness, damping, mass, enabled, prefersReducedMotion]);

  return prefersReducedMotion || !enabled ? target : currentValue;
}

export default useSpringValue;
