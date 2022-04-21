import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {AlbumService} from "@components/album/album.service";
import {Album} from "@shared/interfaces/album";

@Component({
  selector: 'app-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.less']
})
export class AlbumComponent implements OnInit {

  album: Album | undefined;

  constructor(
    public albumService: AlbumService,
    private albumId: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.getAlbumId();
  }

  getAlbumId(): void {
    this.albumId.params.subscribe(params => {
      this.getAlbum(params['id']);
    });
  }

  getAlbum(id: string): void {
    this.albumService.getAlbum(id).subscribe(album => {
      this.album = album;
    });
  }

}
