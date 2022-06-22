export interface imagesItem {
	width: number;
	url: string;
	height: number;
}

export interface artistsItem {
	name: string;
	href: string;
	id: string;
	type: string;
	external_urls: external_urlsItem;
	uri: string;
}

export interface external_urlsItem {
	spotify: string;
}

export interface itemsItem {
	images: Array<imagesItem>;
	release_date_precision: string;
	album_group: string;
	type: string;
	uri: string;
	total_tracks: number;
	artists: Array<artistsItem>;
	release_date: string;
	name: string;
	album_type: string;
	href: string;
	id: string;
	external_urls: external_urlsItem;
}

export interface ArtistAlbum {
	next: string;
	total: number;
	offset: number;
	previous: string;
	limit: number;
	href: string;
	items: Array<itemsItem>;
}

