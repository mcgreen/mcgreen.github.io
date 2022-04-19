import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {NewReleasesComponent} from "@components/new-releases/new-releases.component";

const routes: Routes = [
  {
    path: '',
    component: NewReleasesComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: []
})
export class NewReleasesRoutingModule {
}
