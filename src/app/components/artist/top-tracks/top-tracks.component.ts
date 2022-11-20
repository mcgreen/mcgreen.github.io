import {Component} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ArtistService} from "@components/artist/artist.service";
import {mergeMap, Observable} from "rxjs";

@Component({
  selector: 'app-top-tracks',
  templateUrl: './top-tracks.component.html',
  styleUrls: ['./top-tracks.component.less']
})
export class TopTracksComponent {

  topTracks: Observable<any> | undefined;

  constructor(
    private route: ActivatedRoute,
    private artistService: ArtistService,
  ) { }

  ngOnInit() {
    this.topTracks = this.route.params.pipe(
      mergeMap(params => this.getArtistTopTracks(params['id']))
    );
  }

  getArtistTopTracks(id: string) {
    return this.artistService.getTopTracks(id);
  }
}
