import {NgModule} from '@angular/core';

import {HomeRoutingModule} from './home-routing.module';
import {HomeComponent} from './home.component';
import {NavModule} from "@components/nav/nav.module";
import {NewReleasesModule} from "@components/new-releases/new-releases.module";
import {SharedModule} from "@shared/shared.module";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";


@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    SharedModule,
    HomeRoutingModule,
    NavModule,
    NewReleasesModule,
    MatProgressSpinnerModule,
  ]
})
export class HomeModule {
}
