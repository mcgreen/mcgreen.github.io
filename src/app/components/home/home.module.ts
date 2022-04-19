import {NgModule} from '@angular/core';

import {HomeRoutingModule} from './home-routing.module';
import {HomeComponent} from './home.component';
import {NewReleasesModule} from "@components/new-releases/new-releases.module";
import {SharedModule} from "@shared/shared.module";


@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    SharedModule,
    HomeRoutingModule,
    NewReleasesModule,
  ]
})
export class HomeModule {
}
