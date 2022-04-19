import {NgModule} from '@angular/core';
import {NavComponent} from './nav.component';
import {UserModule} from "@components/user/user.module";
import {SharedModule} from "@shared/shared.module";


@NgModule({
  declarations: [
    NavComponent
  ],
  exports: [
    NavComponent
  ],
  imports: [
    SharedModule,
    UserModule
  ]
})
export class NavModule {
}
