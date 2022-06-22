import {Injectable} from '@angular/core';
import {BaseHttpService} from "@shared/services/base-http.service";
import {APIConstants} from "@shared/constants/api.constants";
import {NewReleases, NewReleasesResponse} from "@shared/interfaces/new-release";
import {BehaviorSubject, map, Observable, tap} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class NewReleaseService {

  private newReleaseUrl: string = APIConstants.API_URL + APIConstants.API_NEW_RELEASES + '?limit=20';

  constructor(
    private http: BaseHttpService,
  ) {
  }

  getNewReleases() {
    return this.http.get<any>(this.newReleaseUrl).pipe(
      map((response: NewReleasesResponse) => {
        const items: NewReleases[] = response.albums.items.map((
          {id, images, name, artists, type, album_type}) =>
          ({id, images, name, artists, type, album_type})
        );
        return items;
      })
    );
  }

}
