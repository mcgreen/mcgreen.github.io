import {NgModule} from '@angular/core';
import {PlayerComponent} from "@components/player/player.component";
import {PlayerRoutingModule} from "@components/player/player-routing.module";
import {CommonModule} from "@angular/common";


@NgModule({
  declarations: [
    PlayerComponent
  ],
  exports: [
    PlayerComponent
  ],
  imports: [
    PlayerRoutingModule,
    CommonModule,
  ]
})
export class PlayerModule {
}
