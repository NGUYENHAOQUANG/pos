import { useEffect, useRef } from 'react';

/**
 * Performance monitoring hook for React Native animations
 * Logs FPS and frame drops to help identify performance issues
 */
export function usePerformanceMonitor(componentName: string, enabled: boolean = false) {
  const frameCount = useRef(0);
  const lastTime = useRef(Date.now());
  const rafId = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!enabled) return;

    const measureFPS = () => {
      frameCount.current++;
      const currentTime = Date.now();
      const elapsed = currentTime - lastTime.current;

      // Log FPS every second
      if (elapsed >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / elapsed);

        if (fps < 55) {
          console.warn(
            `[Performance] ${componentName}: Low FPS detected - ${fps} fps (target: 60 fps)`
          );
        } else {
          console.log(`[Performance] ${componentName}: ${fps} fps`);
        }

        frameCount.current = 0;
        lastTime.current = currentTime;
      }

      rafId.current = requestAnimationFrame(measureFPS);
    };

    rafId.current = requestAnimationFrame(measureFPS);

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [componentName, enabled]);
}

/**
 * Memory usage monitoring for components
 * Helps identify memory leaks in animations
 */
export function useMemoryMonitor(componentName: string, enabled: boolean = false) {
  useEffect(() => {
    if (!enabled) return;

    const mountTime = Date.now();

    const checkMemory = () => {
      if ((performance as any).memory) {
        const memory = (performance as any).memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
        const totalMB = Math.round(memory.totalJSHeapSize / 1048576);

        console.log(
          `[Memory] ${componentName}: ${usedMB}MB / ${totalMB}MB (${Math.round((usedMB / totalMB) * 100)}%)`
        );
      }
    };

    const interval = setInterval(checkMemory, 5000);

    return () => {
      clearInterval(interval);
      const lifetime = Date.now() - mountTime;
      console.log(`[Lifecycle] ${componentName}: Unmounted after ${lifetime}ms`);
    };
  }, [componentName, enabled]);
}
