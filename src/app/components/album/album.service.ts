import {Injectable} from '@angular/core';
import {BaseHttpService} from "@shared/services/base-http.service";
import {Album} from "@shared/interfaces/album";
import {Observable, Subscription, tap} from "rxjs";
import {APIConstants} from "@shared/constants/api.constants";

@Injectable({
  providedIn: 'root'
})
export class AlbumService {

  constructor(
    private http: BaseHttpService,
  ) {
  }

  getAlbum(id: string): Observable<Album> {
    const albumUrl: string = APIConstants.API_URL + `/albums/${id}`;
    return this.http.get<Album>(albumUrl).pipe(
      tap(() => `fetched ${id}`)
    );
  }
}
