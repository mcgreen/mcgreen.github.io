import { Service, effect, signal } from '@angular/core';

export type Theme = 'heat' | 'retro';
const KEY = 'sdash2.theme';

function initial(): Theme {
  try {
    return localStorage.getItem(KEY) === 'retro' ? 'retro' : 'heat';
  } catch {
    return 'heat';
  }
}

/** Theme switch: sets data-theme on <html>; tokens do the rest. */
@Service()
export class ThemeService {
  readonly theme = signal<Theme>(initial());

  constructor() {
    effect(() => {
      const t = this.theme();
      document.documentElement.dataset['theme'] = t;
      try {
        localStorage.setItem(KEY, t);
      } catch {
        /* storage unavailable */
      }
    });
  }

  toggle(): void {
    this.theme.update((t) => (t === 'heat' ? 'retro' : 'heat'));
  }
}
