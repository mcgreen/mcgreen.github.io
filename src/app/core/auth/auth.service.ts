import {Injectable} from '@angular/core';
import {AuthConstants} from "@shared/constants/auth.constants";
import {Observable} from "rxjs";
import {Store} from "../../../store";
import {LoggerService} from "@shared/services/logger.service";
import {APIConstants} from "@shared/constants/api.constants";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  auth$: Observable<string>;
  private spotifyAuthUrl = APIConstants.API_ACCOUNT_URL + APIConstants.API_AUTH;

  constructor(
    private store: Store,
    private logger: LoggerService,
  ) {
    this.auth$ = this.store.select(AuthConstants.AUTH_KEY);
  }

  get authToken() {
    return this.store.value.access_token;
  }

  login(): void {
    window.location.href = this.buildUrlParam(this.spotifyAuthUrl + '?', {
      client_id: AuthConstants.CLIENT_ID,
      response_type: 'token',
      redirect_uri: encodeURIComponent(`${window.location.protocol}//${window.location.host}/login`),
      scope: encodeURIComponent(AuthConstants.SCOPES.join(' ')),
    });
  }

  logout(): void {
    this.store.set(AuthConstants.AUTH_KEY, undefined);
  }

  setToken(token: string | null) {
    this.store.set(AuthConstants.AUTH_KEY, token);
  }

  /* HELPER FUNCTIONS */
  /**
   *Helper function for building a url given a single level parameter object
   *
   * @private
   * @param {string} url - the url to build off of
   * @param {*} params - object of parameters
   * @returns {string} - returns the paramaterized url
   * @memberof SpottrAuthService
   */
  private buildUrlParam(url: string, params: any): string {
    Object.entries(params).forEach(
      ([key, value]) => (url += `&${key}=${value}`)
    );
    return url;
  }

}
