import { Injectable } from '@angular/core';

const CLIENT_ID = '9ce5e2c2c5d24431926e0519083ea029';
const REDIRECT_URI = 'http://localhost:4200/callback';
const SCOPE = 'user-read-private user-read-email';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private spotifyAuthUrl = 'https://accounts.spotify.com/authorize';

  constructor() { }
}
