import {NgModule} from '@angular/core';

import {ArtistRoutingModule} from './artist-routing.module';
import {ArtistComponent} from './artist.component';
import {SharedModule} from "@shared/shared.module";
import {TopTracksComponent} from './top-tracks/top-tracks.component';


@NgModule({
  declarations: [
    ArtistComponent,
    TopTracksComponent
  ],
  imports: [
    ArtistRoutingModule,
    SharedModule
  ]
})
export class ArtistModule {
}
