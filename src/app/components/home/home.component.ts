import {Component, OnInit} from '@angular/core';
import {LoggerService} from "@shared/services/logger.service";
import {Store} from "../../../store";
import {AuthConstants} from "@shared/constants/auth.constants";
import {AuthService} from "@core/auth/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit {

  constructor(
    private store: Store,
    private auth: AuthService,
    private logger: LoggerService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.logger.log(this.store.value.access_token);
    if (!this.store.value.access_token) {
      this.router.navigate(['/login']);
    }
  }

}
