import {Component, OnInit} from '@angular/core';
import {ArtistService} from "@components/artist/artist.service";
import {ActivatedRoute} from "@angular/router";
import {Artist} from "@shared/interfaces/artist";
import {mergeMap, Observable} from "rxjs";

@Component({
  selector: 'app-artist',
  templateUrl: './artist.component.html',
  styleUrls: ['./artist.component.less']
})
export class ArtistComponent implements OnInit {

  artist: Observable<Artist> | undefined;
  albums: any;

  constructor(
    private route: ActivatedRoute,
    private artistService: ArtistService,
    ) {
  }

  ngOnInit(): void {
    this.artist = this.route.params.pipe(
      mergeMap(params => this.getArtist(params['id']))
    )
  }

  getArtist(id: string): Observable<Artist> {
    return this.artistService.getArtist(id);
  }
}
