import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { errorText } from '../../core/errors';
import { formatDate, formatLong } from '../../core/format';
import { PlayerService } from '../../core/player/player.service';
import { safe } from '../../core/resource';
import { AudiobookSummary, ChapterSummary, Paging } from '../../core/spotify/models';
import { SpotifyApi } from '../../core/spotify/spotify-api.service';
import { ExpandableText } from '../../shared/ui/expandable-text';
import { Icon } from '../../shared/ui/icon';
import { MediaRow } from '../../shared/ui/media-row';

/**
 * An audiobook: authors, narrators and chapters. No heat: Spotify returns no popularity or play
 * history for audiobooks or chapters.
 */
@Component({
  selector: 'app-audiobook',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ExpandableText, Icon, MediaRow],
  templateUrl: './audiobook.html',
  styleUrl: './audiobook.scss',
})
export class AudiobookPage {
  /** Bound from the route `/audiobook/:id`. */
  readonly id = input.required<string>();

  private readonly api = inject(SpotifyApi);
  private readonly player = inject(PlayerService);

  private readonly bookRes = httpResource<AudiobookSummary>(() => this.api.req.audiobook(this.id()));
  private readonly chaptersRes = httpResource<Paging<ChapterSummary>>(() => this.api.req.audiobookChapters(this.id()));

  protected readonly book = computed(() => safe(this.bookRes) ?? null);
  protected readonly loading = this.bookRes.isLoading;
  protected readonly error = computed(() => errorText(this.bookRes.error()));
  protected readonly chaptersError = computed(() => errorText(this.chaptersRes.error()));
  protected readonly chaptersLoading = this.chaptersRes.isLoading;

  protected readonly chapters = computed(() =>
    (safe(this.chaptersRes)?.items ?? [])
      .filter((c): c is ChapterSummary => !!c)
      .map((c) => ({
        id: c.id,
        uri: c.uri,
        title: `${c.chapter_number}. ${c.name}`,
        image: c.images?.[0]?.url ?? null,
        explicit: c.explicit,
        description: c.description,
        meta: [formatDate(c.release_date), formatLong(c.duration_ms)].filter(Boolean).join(' · '),
      })),
  );

  protected playBook(book: AudiobookSummary): void {
    void this.player.play({ contextUri: book.uri });
  }

  protected playChapter(uri: string): void {
    void this.player.play({ uris: [uri] });
  }

  protected names(list: { name: string }[]): string {
    return list.map((x) => x.name).join(', ');
  }
}
