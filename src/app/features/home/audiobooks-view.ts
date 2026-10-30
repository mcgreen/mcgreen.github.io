import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { errorText } from '../../core/errors';
import { safe } from '../../core/resource';
import { Paging, SavedAudiobook } from '../../core/spotify/models';
import { SpotifyApi } from '../../core/spotify/spotify-api.service';

type Sort = 'library' | 'chapters' | 'title';

const SORTS: { id: Sort; label: string }[] = [
  { id: 'library', label: 'Library order' },
  { id: 'chapters', label: 'Most chapters' },
  { id: 'title', label: 'A to Z' },
];

/**
 * Home > Audiobooks. Like podcasts: no popularity or listening history from Spotify, so the view
 * shows library facts (authors, narrators, chapters). The list has no `added_at`, so "Library
 * order" is simply the order Spotify returns.
 */
@Component({
  selector: 'app-audiobooks-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './audiobooks-view.html',
  styleUrl: './library-view.scss',
})
export class AudiobooksView {
  private readonly api = inject(SpotifyApi);

  private readonly res = httpResource<Paging<SavedAudiobook>>(() => this.api.req.savedAudiobooks());

  protected readonly sorts = SORTS;
  protected readonly sort = signal<Sort>('library');
  protected readonly loading = this.res.isLoading;
  protected readonly error = computed(() => errorText(this.res.error()));

  protected readonly items = computed(() =>
    (safe(this.res)?.items ?? []).map((b, i) => ({
      id: b.id,
      order: i,
      name: b.name,
      image: b.images[0]?.url ?? null,
      chapters: b.total_chapters,
      authors: b.authors.map((a) => a.name).join(', '),
      narrators: b.narrators.map((n) => n.name).join(', '),
      details: [`${b.total_chapters} ${b.total_chapters === 1 ? 'chapter' : 'chapters'}`, b.publisher, b.edition].filter(Boolean).join(' · '),
    })),
  );

  protected readonly sorted = computed(() => {
    const list = [...this.items()];
    switch (this.sort()) {
      case 'chapters':
        return list.sort((a, b) => b.chapters - a.chapters);
      case 'title':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return list.sort((a, b) => a.order - b.order);
    }
  });

  protected readonly stats = computed(() => {
    const list = this.items();
    return { books: list.length, chapters: list.reduce((n, b) => n + b.chapters, 0) };
  });
}
