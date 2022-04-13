import {Component, OnInit} from '@angular/core';
import {LoggerService} from "@shared/services/logger.service";
import {Store} from "../../../store";
import {AuthConstants} from "@shared/constants/auth.constants";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit {

  constructor(
    private store: Store,
    private logger: LoggerService,
  ) {
  }

  ngOnInit(): void {
    this.logger.log(this.store.select(AuthConstants.AUTH_KEY));
  }

}
