import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ImagePipe} from './pipes/image.pipe';
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {MatChipsModule} from "@angular/material/chips";
import {OrderByPipe} from "@shared/pipes/order-by.pipe";


@NgModule({
  declarations: [
    ImagePipe,
    OrderByPipe,
  ],
  imports: [],
  exports: [
    ImagePipe,
    OrderByPipe,
    CommonModule,
    MatCardModule,
    MatChipsModule,
  ]
})
export class SharedModule {
}
