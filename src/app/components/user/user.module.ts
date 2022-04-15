import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {UserComponent} from "@components/user/user.component";
import {MatMenuModule} from "@angular/material/menu";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";



@NgModule({
  declarations: [
    UserComponent,
  ],
  exports: [
    UserComponent,
  ],
  imports: [
    CommonModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule
  ]
})
export class UserModule { }
