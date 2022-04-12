import {SpotifyScope} from "@shared/types/spotify-scopes";

export interface AuthConfig {
  client_id: string;
  response_type: "token" | string;
  redirect_uri: string;
  state: string;
  show_dialog: boolean;
  scope: SpotifyScope[] | string;
}

export interface AuthResponse {
  access_token: string;
  expires_in: number;
  state: string;
  token_type: string;
}
