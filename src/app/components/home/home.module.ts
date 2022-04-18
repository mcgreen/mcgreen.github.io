import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {HomeRoutingModule} from './home-routing.module';
import {HomeComponent} from './home.component';
import {NavModule} from "@components/nav/nav.module";
import {NewReleasesModule} from "@components/new-releases/new-releases.module";


@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    NavModule,
    NewReleasesModule,
  ]
})
export class HomeModule {
}
