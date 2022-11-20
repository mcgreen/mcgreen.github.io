import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AlbumService} from "@components/album/album.service";
import {Album, Artist} from "@shared/interfaces/album";
import {mergeMap, Observable} from "rxjs";

@Component({
  selector: 'app-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.less']
})
export class AlbumComponent implements OnInit {

  album: Observable<Album> | undefined;

  constructor(
    public albumService: AlbumService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.album = this.route.params.pipe(
      mergeMap(params => this.getAlbum(params['id']))
    )
  }

  getAlbum(id: string): Observable<Album> {
    return this.albumService.getAlbum(id);
  }

  goToArtist(artist: Artist) {
    this.router.navigate(['/artist', artist.id]);
  }
}
