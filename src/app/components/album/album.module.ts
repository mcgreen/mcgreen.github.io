import {NgModule} from '@angular/core';

import {AlbumRoutingModule} from './album-routing.module';
import {AlbumComponent} from './album.component';
import {SharedModule} from "@shared/shared.module";


@NgModule({
  declarations: [
    AlbumComponent
  ],
  imports: [
    AlbumRoutingModule,
    SharedModule
  ]
})
export class AlbumModule {
}
