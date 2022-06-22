import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-albums',
  templateUrl: './albums.component.html',
  styleUrls: ['./albums.component.less']
})
export class AlbumsComponent {

  @Input() album: any;

  constructor() { }

}
