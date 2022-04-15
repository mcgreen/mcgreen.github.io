import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DiscoverComponent} from "@components/discover/discover.component";

const routes: Routes = [
  {
    path: '',
    component: DiscoverComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DiscoverRoutingModule {
}
