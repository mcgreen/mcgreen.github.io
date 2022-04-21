import {Injectable} from '@angular/core';
import {BaseHttpService} from "@shared/services/base-http.service";
import {Me} from "@shared/interfaces/me";
import {AuthConstants} from "@shared/constants/auth.constants";
import {Store} from "../../../../store";
import {Observable, tap} from "rxjs";
import {LoggerService} from "@shared/services/logger.service";
import {Router} from "@angular/router";
import {APIConstants} from "@shared/constants/api.constants";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userUrl: string = APIConstants.API_URL + APIConstants.API_PROFILE;

  constructor(
    private http: BaseHttpService,
    private store: Store,
    private logger: LoggerService,
    private router: Router,
  ) {
  }

  getUserInfo(): Observable<Me> {
    return this.http.get<Me>(this.userUrl).pipe(
      tap(() => this.logger.log(`fetched user profile`)),
    );
  }

  logout() {
    this.store.set(AuthConstants.AUTH_KEY, undefined);
    this.router.navigate(['/login']);
  }
}
