import {NgModule} from '@angular/core';

import {NewReleasesRoutingModule} from './new-releases-routing.module';
import {NewReleasesComponent} from './new-releases.component';
import {SharedModule} from "@shared/shared.module";


@NgModule({
  declarations: [
    NewReleasesComponent
  ],
  exports: [
    NewReleasesComponent
  ],
  imports: [
    NewReleasesRoutingModule,
    SharedModule
  ]
})
export class NewReleasesModule {
}
