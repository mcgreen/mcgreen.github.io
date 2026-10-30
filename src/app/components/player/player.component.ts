import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from "../../../store";
import {LoggerService} from "@shared/services/logger.service";
import {FormBuilder, Validators} from "@angular/forms";

declare const Spotify: any;

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.less']
})
export class PlayerComponent implements OnInit, OnDestroy {

  loadAPI: any;
  player: any;
  device_id: string;
  player_state: any;
  player_state_interval: any;
  devices: any;
  devicesForm: any;

  constructor(
    private store: Store,
    private formBuilder: FormBuilder
  ) {
    this.device_id = '';
  }

  ngOnInit(): void {

    (<any>window).onSpotifyWebPlaybackSDKReady = this.connectPlayer.bind(this);

    this.loadAPI = new Promise((resolve) => {
      console.log('resolving promise...');
      this.loadScript();
      resolve("Complete")
    });

    this.loadAPI.then((arg: any) => {
      console.log(arg);
      console.log("Script loaded");
    })

    let initial_values = {
      device: [this, Validators.required]
    }

    this.devicesForm = this.formBuilder.group(initial_values)
  }

  ngOnDestroy() {
    clearInterval(this.player_state_interval);
  }

  loadScript() {
    console.log('preparing to load...')
    let node = document.createElement('script');
    node.src = "https://sdk.scdn.co/spotify-player.js";
    node.type = 'text/javascript';
    node.async = true;
    document.getElementsByTagName('head')[0].appendChild(node);
  }

  connectPlayer() {
    const token = this.store.value.access_token;
    this.player = new Spotify.Player({
      name: 'spotify-player',
      getOAuthToken: (cb: any) => {
        cb(token);
      },
      enableMediaSession: true,
      volume: 0.5
    });

    // if (this.player) {
    //   let state: any = await this.waitUntilUserHasSelectedPlayer(this.player);
    //   await this.player.resume();
    //   await this.player.setVolume(0.5);
    //   let {
    //     id,
    //     uri: track_uri,
    //     name: track_name,
    //     duration_ms,
    //     artists,
    //     album: {
    //       name: album_name,
    //       uri: album_uri,
    //       images: album_images
    //     }
    //   } = (state.track_window.current_track as any);
    //   console.log(`You're listening to ${track_name} by ${artists[0].name}!`);
    // }

    console.log(this.player);
    console.log("onSpotifyWebPlaybackSDKReady");

    // ready listener
    this.player.addListener('ready', this.ready.bind(this));

    // not_ready listener
    this.player.addListener('not_ready', this.not_ready.bind(this));


    // initialization_error listener
    this.player.addListener('initialization_error', this.initialization_error.bind(this));


    // authentication_error listener
    this.player.addListener('authentication_error', this.authentication_error.bind(this));

    // account_error listener
    this.player.addListener('account_error', this.account_error.bind(this));

    // playback_error listener
    this.player.addListener('playback_error', this.playback_error.bind(this));

    this.player.connect().then((success: any) => {
      console.log(success);
      console.log("Player connected!");
      this.player.resume().then((resume: any) => {
        // Playback resumed
        console.log(resume);
      });
      // this.player.togglePlay.bind(this);
    });


  }

  isListenerExists(listener: string): boolean {

    console.log(this.player._eventListeners['ready'].length);

    if (this.player._eventListeners['ready'].length > 0) {
      return true;
    } else {
      return false;
    }

  }

  ready(device_id: string) {
    this.device_id = device_id;
    console.log("ready Listener");
  }

  not_ready(device_id: string) {
    this.device_id = device_id;
    console.log("not_ready Listener");
  }

  // error listeners
  initialization_error(message: any) {
    console.log("initialization_error Listener")
    console.log(message);
  }

  authentication_error(message: any) {
    console.log("authentication_error Listener")
    console.log(message);
  }

  account_error(message: any) {
    console.log("account_error Listener")
    console.log(message);
  }

  playback_error(message: any) {
    console.log("playback_error Listener")
    console.log(message);
  }

  getCurrentState() {
    this.player.getCurrentState().then((state: any) => {
      console.log("Current State: ", state);
    });
  }

  incrementVolume() {
    console.log("Incrementing volume by 1%")
  }

  decrementVolume() {
    console.log("decrementing volumne by 1%")
  }

  getSongProgress() {
    if (!this.player_state) {
      return 0;
    } else {
      let percent = Math.trunc((this.player_state.progress_ms / this.player_state.item.duration_ms) * 100);

      if (!Number.isNaN(percent)) {
        return percent;
      } else {
        return 0;
      }
    }
  }

}
