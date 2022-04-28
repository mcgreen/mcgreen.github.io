import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ArtistRoutingModule } from './artist-routing.module';
import { ArtistComponent } from './artist.component';
import {SharedModule} from "@shared/shared.module";
import { TopTracksComponent } from './top-tracks/top-tracks.component';
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatExpansionModule} from "@angular/material/expansion";


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
export class ArtistModule { }
