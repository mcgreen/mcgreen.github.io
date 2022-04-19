import { Component, OnInit } from '@angular/core';
import {UserService} from "@components/nav/user/user.service";
import {Observable} from "rxjs";
import {MeResponse} from "@shared/interfaces/me-response";
import {AuthService} from "@core/auth/auth.service";

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.less']
})
export class UserComponent implements OnInit {

  // @ts-ignore
  user$: Observable<MeResponse>;

  constructor(
    private userService: UserService,
    private auth: AuthService,
  ) { }

  ngOnInit(): void {
    this.auth.auth$.subscribe(token => {
      if (token) {
        this.fetchUserDetails();
      }
    });
  }

  fetchUserDetails() {
    this.user$ = this.userService.getUserInfo();
  }

  logout() {
    this.userService.logout();
  }
}
