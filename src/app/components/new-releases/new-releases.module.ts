import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NewReleasesRoutingModule } from './new-releases-routing.module';
import { NewReleasesComponent } from './new-releases.component';
import {MatCardModule} from "@angular/material/card";
import {MatChipsModule} from "@angular/material/chips";
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
export class NewReleasesModule { }
