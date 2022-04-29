import {Component, Input, OnInit} from '@angular/core';
import {ArtistTopTracks} from "@shared/interfaces/artist-top-tracks";

@Component({
  selector: 'app-top-tracks',
  templateUrl: './top-tracks.component.html',
  styleUrls: ['./top-tracks.component.less']
})
export class TopTracksComponent {

  @Input() topTrack: any;

  constructor() { }

  whatHappen($event: MouseEvent) {
    console.log($event);
  }
}
