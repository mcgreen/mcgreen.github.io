import {Injectable} from '@angular/core';
import {BaseHttpService} from "@shared/services/base-http.service";
import {Observable, tap} from "rxjs";
import {APIConstants} from "@shared/constants/api.constants";
import {Artist} from "@shared/interfaces/artist";
import {ArtistTopTracks} from "@shared/interfaces/artist-top-tracks";

@Injectable({
  providedIn: 'root'
})
export class ArtistService {

  constructor(
    private http: BaseHttpService,
  ) {
  }

  getArtist(id: string): Observable<Artist> {
    const artistUrl: string = APIConstants.API_URL + `/artists/${id}`;
    return this.http.get<Artist>(artistUrl).pipe(
      tap(() => `fetched artist ${id}`),
    );
  }

  getTopTracks(id: string): Observable<ArtistTopTracks[]> {
    const artistTopTrackUrl: string = APIConstants.API_URL + `/artists/${id}/top-tracks?market=us`;
    return this.http.get<ArtistTopTracks[]>(artistTopTrackUrl).pipe(
      tap(() => `fetched artist top tracks ${id}`),
    );
  }
}
