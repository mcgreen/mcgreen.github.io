import {Component, OnInit} from '@angular/core';
import {LoggerService} from "@shared/services/logger.service";
import {Store} from "../../../store";
import {NewReleasesItem} from "@shared/interfaces/new-release";
import {NewReleaseService} from "@components/home/new-releases/new-release.service";
import { Observable } from 'rxjs';
import {SdkPlayerService} from "@shared/services/sdk-player.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit {

  newReleases: any;

  constructor(
    private logger: LoggerService,
    private newReleasesService: NewReleaseService,
    private store: Store,
    private playerService: SdkPlayerService,
  ) {
  }

  ngOnInit(): void {
    // this.playerService.openPlayer();
    this.newReleases = this.newReleasesService.getNewReleases();
  }

}
