import {NgModule} from '@angular/core';
import {NavComponent} from './nav.component';
import {SharedModule} from "@shared/shared.module";
import {UserComponent} from "@components/nav/user/user.component";


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
    SharedModule,
  ]
})
export class NavModule {
}
