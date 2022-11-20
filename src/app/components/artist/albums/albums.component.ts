import {Component, Input, OnInit} from '@angular/core';
import {mergeMap, Observable} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {ArtistService} from "@components/artist/artist.service";

@Component({
  selector: 'app-albums',
  templateUrl: './albums.component.html',
  styleUrls: ['./albums.component.less']
})
export class AlbumsComponent {

  albums: Observable<any> | undefined;

  constructor(
    private route: ActivatedRoute,
    private artistService: ArtistService,
  ) { }

  ngOnInit() {
    this.albums = this.route.params.pipe(
      mergeMap(params => this.getArtistAlbums(params['id']))
    );
  }

  getArtistAlbums(id: string): Observable<any> {
    return this.artistService.getArtistAlbums(id);
  }

}
