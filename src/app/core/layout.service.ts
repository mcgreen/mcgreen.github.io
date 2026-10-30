import { Service, effect, signal } from '@angular/core';

/** How shelves and card grids look on a phone: a row you swipe sideways, or a vertical list. */
export type ShelfStyle = 'swipe' | 'list';
const KEY = 'sdash2.shelves';

function initial(): ShelfStyle {
  try {
    return localStorage.getItem(KEY) === 'list' ? 'list' : 'swipe';
  } catch {
    return 'swipe';
  }
}

/**
 * Phone layout switch: sets data-shelves on <html>; the stylesheets (the `list-mode` mixin) do the
 * rest. Above phone width it changes nothing.
 */
@Service()
export class LayoutService {
  readonly shelves = signal<ShelfStyle>(initial());

  constructor() {
    effect(() => {
      const s = this.shelves();
      document.documentElement.dataset['shelves'] = s;
      try {
        localStorage.setItem(KEY, s);
      } catch {
        /* storage unavailable */
      }
    });
  }

  toggle(): void {
    this.shelves.update((s) => (s === 'swipe' ? 'list' : 'swipe'));
  }
}
