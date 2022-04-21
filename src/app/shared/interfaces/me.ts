export interface Images {
	width: any;
	url: string;
	height: any;
}

export interface Followers {
	total: number;
	href: any;
}

export interface ExplicitContent {
	filter_locked: boolean;
	filter_enabled: boolean;
}

export interface ExternalURLS {
	spotify: string;
}

export interface Me {
	country: string;
	images: Array<Images>;
	product: string;
	followers: Followers;
	explicit_content: ExplicitContent;
	href: string;
	id: string;
	display_name: string;
	type: string;
	external_urls: ExternalURLS;
	uri: string;
	email: string;
}


