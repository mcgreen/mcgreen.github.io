import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ArtistComponent} from "@components/artist/artist.component";

const routes: Routes = [
  {
    path: '',
    component: ArtistComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: []
})
export class ArtistRoutingModule { }
