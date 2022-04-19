import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AlbumComponent} from "@components/album/album.component";

const routes: Routes = [
  {
    path: '',
    component: AlbumComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: []
})
export class AlbumRoutingModule {
}
