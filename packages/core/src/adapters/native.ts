import type { FrameAdapter } from '../types.js';

export type EasingFunction = (t: number) => number;

export const EASING: Record<string, EasingFunction> = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInSine: (t: number) => 1 - Math.cos((t * Math.PI) / 2),
  easeOutSine: (t: number) => Math.sin((t * Math.PI) / 2),
  easeInOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
  easeInExpo: (t: number) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
  easeOutExpo: (t: number) => (t === 1 ? 1 : -Math.pow(2, -10 * t) + 1),
  easeInOutExpo: (t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if ((t *= 2) < 1) return 0.5 * Math.pow(2, 10 * (t - 1));
    return 0.5 * (-Math.pow(2, -10 * (t - 1)) + 2);
  },
};

export interface Tween {
  target: any; // DOM Element or selector string or object
  resolvedElement?: any;
  startTime: number;
  duration: number;
  fromValues: Record<string, any>;
  toValues: Record<string, any>;
  easing: EasingFunction;
}

export interface TweenOptions {
  duration?: number;
  ease?: string | EasingFunction;
  delay?: number;
  [key: string]: any;
}

/**
 * Native deterministic timeline animation engine.
 * Works seamlessly in both browser and headless environments without any third-party dependencies.
 */
export class NativeTimelineAdapter implements FrameAdapter {
  name = 'native';
  private tweens: Tween[] = [];
  private totalDuration = 0;

  constructor() {}

  /**
   * Add a tween animating from current/default values to `toProps`
   */
  to(target: any, options: TweenOptions, position?: number): this {
    const duration = options.duration ?? 1;
    const delay = options.delay ?? 0;
    const startTime = position !== undefined ? position + delay : this.totalDuration + delay;

    const easeFn = typeof options.ease === 'function'
      ? options.ease
      : (options.ease && EASING[options.ease]) || EASING.easeInOutCubic;

    const { duration: _d, ease: _e, delay: _del, ...toValues } = options;

    // Create placeholder fromValues, which will be populated or defaulted
    const fromValues: Record<string, any> = {};
    for (const key of Object.keys(toValues)) {
      if (key === 'opacity') fromValues[key] = 1;
      else if (key.startsWith('translate') || key === 'x' || key === 'y') fromValues[key] = 0;
      else if (key.startsWith('scale')) fromValues[key] = 1;
      else if (key.startsWith('rotate')) fromValues[key] = 0;
      else fromValues[key] = 0;
    }

    this.tweens.push({
      target,
      startTime,
      duration,
      fromValues,
      toValues,
      easing: easeFn,
    });

    const endTime = startTime + duration;
    if (endTime > this.totalDuration) {
      this.totalDuration = endTime;
    }

    return this;
  }

  /**
   * Add a tween with explicit from and to values
   */
  fromTo(
    target: any,
    fromProps: Record<string, any>,
    toProps: TweenOptions,
    position?: number
  ): this {
    const duration = toProps.duration ?? 1;
    const delay = toProps.delay ?? 0;
    const startTime = position !== undefined ? position + delay : this.totalDuration + delay;

    const easeFn = typeof toProps.ease === 'function'
      ? toProps.ease
      : (toProps.ease && EASING[toProps.ease]) || EASING.easeInOutCubic;

    const { duration: _d, ease: _e, delay: _del, ...toValues } = toProps;

    this.tweens.push({
      target,
      startTime,
      duration,
      fromValues: fromProps,
      toValues,
      easing: easeFn,
    });

    const endTime = startTime + duration;
    if (endTime > this.totalDuration) {
      this.totalDuration = endTime;
    }

    return this;
  }

  /**
   * Set immediate property values at a specific time
   */
  set(target: any, values: Record<string, any>, position?: number): this {
    return this.fromTo(target, values, { ...values, duration: 0.0001 }, position);
  }

  seek(timeInSeconds: number): void {
    const t = Math.max(0, timeInSeconds);

    for (const tween of this.tweens) {
      const el = this.resolveTarget(tween);
      if (!el) continue;

      let progress: number;
      if (tween.duration <= 0.0001) {
        progress = t >= tween.startTime ? 1 : 0;
      } else if (t <= tween.startTime) {
        progress = 0;
      } else if (t >= tween.startTime + tween.duration) {
        progress = 1;
      } else {
        const rawProgress = (t - tween.startTime) / tween.duration;
        progress = tween.easing(Math.min(Math.max(rawProgress, 0), 1));
      }

      this.applyInterpolatedStyles(el, tween.fromValues, tween.toValues, progress);
    }
  }

  private resolveTarget(tween: Tween): any {
    if (tween.resolvedElement) return tween.resolvedElement;
    if (typeof tween.target === 'string') {
      if (typeof document !== 'undefined') {
        tween.resolvedElement = document.querySelector(tween.target);
      }
    } else {
      tween.resolvedElement = tween.target;
    }
    return tween.resolvedElement;
  }

  private applyInterpolatedStyles(
    element: any,
    from: Record<string, any>,
    to: Record<string, any>,
    progress: number
  ): void {
    if (!element || !element.style) return;

    let transformValues: Record<string, string> = {};

    for (const key of Object.keys(to)) {
      const fromVal = from[key] !== undefined ? from[key] : 0;
      const toVal = to[key];

      if (key === 'opacity') {
        const current = fromVal + (toVal - fromVal) * progress;
        element.style.opacity = current.toFixed(4);
      } else if (key === 'x' || key === 'translateX') {
        const fromNum = parseFloat(String(fromVal));
        const toNum = parseFloat(String(toVal));
        const current = fromNum + (toNum - fromNum) * progress;
        const unit = String(toVal).replace(/^-?[\d.]+/, '') || 'px';
        transformValues['translateX'] = `${current.toFixed(2)}${unit}`;
      } else if (key === 'y' || key === 'translateY') {
        const fromNum = parseFloat(String(fromVal));
        const toNum = parseFloat(String(toVal));
        const current = fromNum + (toNum - fromNum) * progress;
        const unit = String(toVal).replace(/^-?[\d.]+/, '') || 'px';
        transformValues['translateY'] = `${current.toFixed(2)}${unit}`;
      } else if (key === 'scale') {
        const fromNum = parseFloat(String(fromVal));
        const toNum = parseFloat(String(toVal));
        const current = fromNum + (toNum - fromNum) * progress;
        transformValues['scale'] = current.toFixed(4);
      } else if (key === 'rotate') {
        const fromNum = parseFloat(String(fromVal));
        const toNum = parseFloat(String(toVal));
        const current = fromNum + (toNum - fromNum) * progress;
        const unit = String(toVal).replace(/^-?[\d.]+/, '') || 'deg';
        transformValues['rotate'] = `${current.toFixed(2)}${unit}`;
      } else if (typeof toVal === 'number' && typeof fromVal === 'number') {
        const current = fromVal + (toVal - fromVal) * progress;
        element.style[key] = current.toFixed(2);
      } else {
        // Fallback: switch at 50%
        element.style[key] = progress >= 0.5 ? toVal : fromVal;
      }
    }

    if (Object.keys(transformValues).length > 0) {
      const parts: string[] = [];
      if (transformValues['translateX'] || transformValues['translateY']) {
        const tx = transformValues['translateX'] || '0px';
        const ty = transformValues['translateY'] || '0px';
        parts.push(`translate(${tx}, ${ty})`);
      }
      if (transformValues['scale']) {
        parts.push(`scale(${transformValues['scale']})`);
      }
      if (transformValues['rotate']) {
        parts.push(`rotate(${transformValues['rotate']})`);
      }
      element.style.transform = parts.join(' ');
    }
  }

  getDuration(): number {
    return this.totalDuration;
  }

  destroy(): void {
    this.tweens = [];
    this.totalDuration = 0;
  }
}
