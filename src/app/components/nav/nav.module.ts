import {NgModule} from '@angular/core';
import {NavComponent} from './nav.component';
import {SharedModule} from "@shared/shared.module";
import {UserComponent} from "@components/nav/user/user.component";
import {RouterModule} from "@angular/router";
import {MatMenuModule} from "@angular/material/menu";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatListModule} from "@angular/material/list";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {CommonModule} from "@angular/common";


@NgModule({
  declarations: [
    NavComponent,
    UserComponent
  ],
  exports: [
    NavComponent,
    UserComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatMenuModule,
    MatToolbarModule,
    MatListModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
  ]
})
export class NavModule {
}
