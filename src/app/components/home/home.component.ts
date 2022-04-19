import {Component, OnInit} from '@angular/core';
import {LoggerService} from "@shared/services/logger.service";
import {Store} from "../../../store";
import {AuthConstants} from "@shared/constants/auth.constants";
import {AuthService} from "@core/auth/auth.service";
import {Router} from "@angular/router";
import {NewReleasesItem} from "@shared/interfaces/new-release";
import {NewReleaseService} from "@components/new-releases/new-release.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit {

  newReleases: NewReleasesItem[] = [];

  constructor(
    private logger: LoggerService,
    private newReleasesService: NewReleaseService,
    private store: Store,
  ) {
    this.logger.log(this.store.value.access_token);
  }

  ngOnInit(): void {
    this.getNewReleases();
  }

  getNewReleases(): void {
    this.newReleasesService.getNewReleases().subscribe((response: any) => {
      this.newReleases = response;
    });
  }

}
