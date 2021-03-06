import {Component, OnInit} from '@angular/core';
import {ArtistService} from "@components/artist/artist.service";
import {ActivatedRoute} from "@angular/router";
import {Artist} from "@shared/interfaces/artist";
import {ArtistTopTracks} from "@shared/interfaces/artist-top-tracks";

@Component({
  selector: 'app-artist',
  templateUrl: './artist.component.html',
  styleUrls: ['./artist.component.less']
})
export class ArtistComponent implements OnInit {

  artist: Artist | undefined;
  artistId: string = '';
  topTracks: any;

  constructor(
    private route: ActivatedRoute,
    private artistService: ArtistService,
  ) {
  }

  ngOnInit(): void {
    this.getArtistId();
    this.getArtist();
    this.getArtistTopTracks();
  }

  getArtistId(): void {
    this.route.params.subscribe(params => this.artistId = params['id']);
  }

  getArtist(): void {
    this.artistService.getArtist(this.artistId).subscribe(artist => {
      this.artist = artist;
    });
  }

  getArtistTopTracks() {
    this.artistService.getTopTracks(this.artistId).subscribe(tracks => {
      this.topTracks = tracks;
    });
  }
}
