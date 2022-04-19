import {Component, Input} from '@angular/core';
import {NewReleaseService} from "@components/home/new-releases/new-release.service";
import {NewReleasesItem} from "@shared/interfaces/new-release";

@Component({
  selector: 'app-new-releases',
  templateUrl: './new-releases.component.html',
  styleUrls: ['./new-releases.component.less']
})
export class NewReleasesComponent {

  @Input() item: NewReleasesItem | undefined;

  constructor(
    private newReleaseService: NewReleaseService,
  ) {
  }

}
