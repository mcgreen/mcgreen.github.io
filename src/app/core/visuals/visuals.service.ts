import { Service, effect, signal } from '@angular/core';

const KEY = 'sdash2.blast';

function initial(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

/** "Blast mode" switch: full-screen music visuals behind the app, in either theme. */
@Service()
export class VisualsService {
  readonly blast = signal(initial());

  constructor() {
    effect(() => {
      const on = this.blast();
      document.documentElement.toggleAttribute('data-blast', on);
      try {
        localStorage.setItem(KEY, on ? '1' : '0');
      } catch {
        /* storage unavailable */
      }
    });
  }

  toggle(): void {
    this.blast.update((v) => !v);
  }
}
