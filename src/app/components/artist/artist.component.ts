import {Component, OnInit} from '@angular/core';
import {ArtistService} from "@components/artist/artist.service";
import {ActivatedRoute} from "@angular/router";
import {Artist} from "@shared/interfaces/artist";

@Component({
  selector: 'app-artist',
  templateUrl: './artist.component.html',
  styleUrls: ['./artist.component.less']
})
export class ArtistComponent implements OnInit {

  artist: Artist | undefined;

  constructor(
    private artistId: ActivatedRoute,
    private artistService: ArtistService,
  ) {
  }

  ngOnInit(): void {
    this.getArtistId();
  }

  getArtistId(): void {
    this.artistId.params.subscribe(params => this.getArtist(params['id']));
  }

  getArtist(id: string): void {
    this.artistService.getArtist(id).subscribe(artist => {
      this.artist = artist;
    })
  }
}
