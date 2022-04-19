import {NgModule} from '@angular/core';

import {HomeRoutingModule} from './home-routing.module';
import {HomeComponent} from './home.component';
import {SharedModule} from "@shared/shared.module";
import {NewReleasesComponent} from "@components/home/new-releases/new-releases.component";


@NgModule({
  declarations: [
    HomeComponent,
    NewReleasesComponent,
  ],
  imports: [
    SharedModule,
    HomeRoutingModule,
  ]
})
export class HomeModule {
}
