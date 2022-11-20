import {Injectable} from '@angular/core';
import {Store} from "../../../store";

@Injectable({
  providedIn: 'root'
})
export class SdkPlayerService {

  constructor(private store: Store) {
    console.log("meat");
  }

  // openPlayer() {
  //   if (this.store.value.access_token) {
  //     console.log("I am opening player");
  //     // await this.waitForSpotifyWebPlaybackSDKToLoad();
  //   }
  // }
  //
  // private waitForSpotifyWebPlaybackSDKToLoad() {
  //   // eslint-disable-next-line @typescript-eslint/no-empty-function
  //   // @ts-ignore
  //   window.onSpotifyWebPlaybackSDKReady = () => {
  //     // @ts-ignore
  //     const player = new Spotify.Player({
  //       name: 'Web Playback SDK Quick Start Player', getOAuthToken: (cb: any) => {
  //         cb(this.store.value.access_token);
  //       }, volume: 0.5
  //     });
  //
  //     player.connect();
  //   }
  // }
}
