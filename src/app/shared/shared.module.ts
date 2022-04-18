import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { ImagePipe } from './pipes/image.pipe';


@NgModule({
  declarations: [
    ImagePipe
  ],
  imports: [
    CommonModule,
  ],
    exports: [
        ImagePipe
    ]
})
export class SharedModule {
}
