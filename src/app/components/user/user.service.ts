import {Injectable} from '@angular/core';
import {BaseHttpService} from "@shared/services/base-http.service";
import {MeResponse} from "@shared/interfaces/me-response";
import {AuthConstants} from "@shared/constants/auth.constants";
import {HttpHeaders} from "@angular/common/http";
import {Store} from "../../../store";
import {Observable, tap} from "rxjs";
import {LoggerService} from "@shared/services/logger.service";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userUrl: string = AuthConstants.API_URL + AuthConstants.API_PROFILE;

  constructor(
    private http: BaseHttpService,
    private store: Store,
    private logger: LoggerService,
    private router: Router,
  ) {
  }

  getUserInfo(): Observable<MeResponse> {
    return this.http.get<MeResponse>(this.userUrl).pipe(
      tap(() => this.logger.log(`fetched user profile`)),
    );
  }

  logout() {
    this.store.set(AuthConstants.AUTH_KEY, undefined);
    this.router.navigate(['/login']);
  }
}
