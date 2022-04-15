import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "@core/auth/auth.service";
import {map, tap} from "rxjs";
import {LoggerService} from "@shared/services/logger.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private logger: LoggerService
  ) {
    this.route.fragment
      .pipe(
        map((fragment: any) => new URLSearchParams(fragment)),
        map((params) => ({
          access_token: params.get('access_token'),
          id_token: params.get('id_token'),
          error: params.get('error'),
        })),
        tap((res) => {
          auth.setToken(res.access_token);
        })
      )
      .subscribe(async (res) => {
        if (!res.access_token) {
          return;
        }

        this.auth.setToken(res.access_token);
      });
  }

  ngOnInit(): void {
    if (this.auth.authToken) {
      this.router.navigate(['/home']);
    }
  }

  login(): void {
    this.auth.login();
  }

}
