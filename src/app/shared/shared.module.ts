import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ImagePipe} from './pipes/image.pipe';
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {MatChipsModule} from "@angular/material/chips";
import {OrderByPipe} from "@shared/pipes/order-by.pipe";
import {MatMenuModule} from "@angular/material/menu";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatListModule} from "@angular/material/list";
import {MatSidenavModule} from "@angular/material/sidenav";
import {RouterModule} from "@angular/router";
import {MatIconModule} from "@angular/material/icon";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import { UriPipe } from './pipes/uri.pipe';


@NgModule({
  declarations: [
    ImagePipe,
    OrderByPipe,
    UriPipe,
  ],
  imports: [],
  exports: [
    ImagePipe,
    OrderByPipe,
    UriPipe,
    CommonModule,
    RouterModule,
    MatMenuModule,
    MatToolbarModule,
    MatListModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ]
})
export class SharedModule {
}
