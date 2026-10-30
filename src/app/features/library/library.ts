import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Sidebar } from '../../shared/ui/sidebar';

/**
 * "Your library" as a page. On wide screens the library lives in the left sidebar; on phones the
 * sidebar is hidden, and this page (linked from the top bar) is how you reach it.
 */
@Component({
  selector: 'app-library',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Sidebar],
  templateUrl: './library.html',
  styleUrl: './library.scss',
})
export class Library {}
