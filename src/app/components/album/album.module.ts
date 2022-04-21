import {NgModule} from '@angular/core';

import {AlbumRoutingModule} from './album-routing.module';
import {AlbumComponent} from './album.component';
import {SharedModule} from "@shared/shared.module";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";


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
