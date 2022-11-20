"use strict";(self.webpackChunksdash=self.webpackChunksdash||[]).push([[850],{2850:(j,A,o)=>{o.r(A),o.d(A,{ArtistModule:()=>J});var c=o(4996),m=o(5577),t=o(5e3),l=o(8505),g=o(3121),O=o(8767);let u=(()=>{class r{constructor(i){this.http=i}getArtist(i){return this.http.get(g.g.API_URL+`/artists/${i}`).pipe((0,l.b)(()=>`fetched artist ${i}`))}getTopTracks(i){return this.http.get(g.g.API_URL+`/artists/${i}/top-tracks?market=us`).pipe((0,l.b)(()=>`fetched artist top tracks ${i}`))}getArtistAlbums(i){return this.http.get(g.g.API_URL+`/artists/${i}/albums`).pipe((0,l.b)(()=>`fetched artist top tracks ${i}`),(0,l.b)(p=>console.log(p)))}}return r.\u0275fac=function(i){return new(i||r)(t.LFG(O.q))},r.\u0275prov=t.Yz7({token:r,factory:r.\u0275fac,providedIn:"root"}),r})();var e=o(9808),s=o(9224),T=o(5245),x=o(9772),d=o(9417),f=o(3251),C=o(4171),_=o(9283);function Z(r,n){1&r&&(t.TgZ(0,"mat-chip",9),t._uU(1,"E"),t.qZA())}function y(r,n){if(1&r&&(t.TgZ(0,"mat-card",3)(1,"mat-card-title-group")(2,"mat-card-title")(3,"div"),t._uU(4),t.YNc(5,Z,2,0,"mat-chip",4),t.qZA()()(),t.TgZ(6,"mat-card-subtitle")(7,"div",5),t._uU(8),t.TgZ(9,"mat-icon",6),t._uU(10,"whatshot "),t.qZA()()(),t.TgZ(11,"div",7),t._UZ(12,"iframe",8),t.ALo(13,"uri"),t.qZA()()),2&r){const i=n.$implicit;t.xp6(4),t.hij(" ",i.name," "),t.xp6(1),t.Q6J("ngIf",i.explicit),t.xp6(3),t.hij(" ",i.popularity," "),t.xp6(4),t.Q6J("src",t.lcZ(13,4,i.uri),t.uOi)}}function b(r,n){if(1&r&&(t.TgZ(0,"div",1),t.YNc(1,y,14,6,"mat-card",2),t.ALo(2,"orderBy"),t.qZA()),2&r){const i=n.ngIf;t.xp6(1),t.Q6J("ngForOf",t.xi3(2,1,i.tracks,"!popularity"))}}let P=(()=>{class r{constructor(i,a){this.route=i,this.artistService=a}ngOnInit(){this.topTracks=this.route.params.pipe((0,m.z)(i=>this.getArtistTopTracks(i.id)))}getArtistTopTracks(i){return this.artistService.getTopTracks(i)}}return r.\u0275fac=function(i){return new(i||r)(t.Y36(c.gz),t.Y36(u))},r.\u0275cmp=t.Xpm({type:r,selectors:[["app-top-tracks"]],decls:2,vars:3,consts:[["class","container",4,"ngIf"],[1,"container"],["class","top-track-card",4,"ngFor","ngForOf"],[1,"top-track-card"],["matTooltip","EXPLICIT","disabled","","class","top-track-explicit",4,"ngIf"],[1,"top-track-popularity"],["matTooltipPosition","right","matTooltip","TRACK POPULARITY",1,"top-track-popularity-icon"],[1,"top-track"],["allowtransparency","true","allow","encrypted-media",3,"src"],["matTooltip","EXPLICIT","disabled","",1,"top-track-explicit"]],template:function(i,a){1&i&&(t.YNc(0,b,3,4,"div",0),t.ALo(1,"async")),2&i&&t.Q6J("ngIf",t.lcZ(1,1,a.topTracks))},directives:[e.O5,e.sg,s.a8,s.C1,s.n5,d.HS,x.gM,s.$j,T.Hw],pipes:[e.Ov,C.d,_.P],styles:[".container[_ngcontent-%COMP%]{width:100%;margin-top:1em;display:flex;flex-direction:row;flex-wrap:wrap;justify-content:space-evenly}.top-track[_ngcontent-%COMP%]{margin-bottom:1em}.top-track-card[_ngcontent-%COMP%]{margin-bottom:1em;width:300px;height:250px}.top-track-explicit[_ngcontent-%COMP%]{border:1px solid #1DB954;margin-left:.2em}.top-track-popularity[_ngcontent-%COMP%]{margin-right:.2em;font-size:30px}.top-track-popularity-icon[_ngcontent-%COMP%]{font-size:30px;color:#de541e}"]}),r})();var v=o(1413);function M(r,n){if(1&r){const i=t.EpF();t.TgZ(0,"mat-card",3)(1,"mat-card-title-group")(2,"mat-card-title")(3,"div",4),t.NdJ("click",function(){const h=t.CHM(i).$implicit;return t.oxw(2).goToAlbum(h.id)}),t._uU(4),t.qZA()()(),t.TgZ(5,"img",5),t.NdJ("click",function(){const h=t.CHM(i).$implicit;return t.oxw(2).goToAlbum(h.id)}),t.ALo(6,"image"),t.qZA()()}if(2&r){const i=n.$implicit;t.xp6(4),t.hij(" ",i.name," "),t.xp6(1),t.Q6J("src",t.lcZ(6,2,i.images),t.LSH)}}function k(r,n){if(1&r&&(t.TgZ(0,"div",1),t.YNc(1,M,7,4,"mat-card",2),t.ALo(2,"orderBy"),t.qZA()),2&r){const i=n.ngIf;t.xp6(1),t.Q6J("ngForOf",t.xi3(2,1,i.items,"!release_date"))}}let w=(()=>{class r{constructor(i,a,p){this.route=i,this.artistService=a,this.router=p}ngOnInit(){this.albums=this.route.params.pipe((0,m.z)(i=>this.getArtistAlbums(i.id)))}getArtistAlbums(i){return this.artistService.getArtistAlbums(i)}goToAlbum(i){this.router.navigate(["/album",i])}}return r.\u0275fac=function(i){return new(i||r)(t.Y36(c.gz),t.Y36(u),t.Y36(c.F0))},r.\u0275cmp=t.Xpm({type:r,selectors:[["app-albums"]],decls:2,vars:3,consts:[["class","container",4,"ngIf"],[1,"container"],["class","artist-album-card",4,"ngFor","ngForOf"],[1,"artist-album-card"],[3,"click"],["alt","",1,"artist-album-image",3,"src","click"]],template:function(i,a){1&i&&(t.YNc(0,k,3,4,"div",0),t.ALo(1,"async")),2&i&&t.Q6J("ngIf",t.lcZ(1,1,a.albums))},directives:[e.O5,e.sg,s.a8,s.C1,s.n5],pipes:[e.Ov,C.d,v.I],styles:[".container[_ngcontent-%COMP%]{width:100%;margin-top:1em;display:inline-flex;flex-wrap:wrap;justify-content:space-evenly}.artist-album[_ngcontent-%COMP%]{margin:1em;display:flex}.artist-album-card[_ngcontent-%COMP%]{margin-bottom:1em;width:300px;height:250px}.artist-album-image[_ngcontent-%COMP%]{cursor:pointer;width:80%;height:80%;margin-left:2em;margin-top:.5em}"]}),r})();function I(r,n){if(1&r&&(t.TgZ(0,"mat-chip",18),t._uU(1),t.ALo(2,"titlecase"),t.qZA()),2&r){const i=n.$implicit;t.xp6(1),t.Oqu(t.lcZ(2,1,i))}}function U(r,n){1&r&&(t.TgZ(0,"div",19),t._uU(1," Top Tracks "),t.qZA())}function L(r,n){1&r&&t._uU(0,"Albums")}function S(r,n){if(1&r&&(t.TgZ(0,"mat-card",1)(1,"mat-card-title-group",2)(2,"mat-card-title",3),t._uU(3),t.qZA(),t.TgZ(4,"mat-card-subtitle")(5,"div",4)(6,"span",5),t._uU(7),t.ALo(8,"number"),t.qZA(),t.TgZ(9,"mat-icon",6),t._uU(10,"group "),t.qZA()(),t.TgZ(11,"div",7)(12,"span",8),t._uU(13),t.qZA(),t.TgZ(14,"mat-icon",9),t._uU(15,"whatshot "),t.qZA()(),t.TgZ(16,"div",10)(17,"mat-chip-list"),t.YNc(18,I,3,3,"mat-chip",11),t.qZA()(),t._UZ(19,"iframe",12),t.ALo(20,"uri"),t.qZA(),t._UZ(21,"img",13),t.ALo(22,"image"),t.qZA(),t.TgZ(23,"div",14)(24,"mat-tab-group")(25,"mat-tab"),t.YNc(26,U,2,0,"ng-template",15),t.TgZ(27,"div",16),t._UZ(28,"app-top-tracks"),t.qZA()(),t.TgZ(29,"mat-tab"),t.YNc(30,L,1,0,"ng-template",15),t.TgZ(31,"div",17),t._UZ(32,"app-albums"),t.qZA()()()()()),2&r){const i=n.ngIf;t.xp6(3),t.Oqu(i.name),t.xp6(4),t.Oqu(t.lcZ(8,6,i.followers.total)),t.xp6(6),t.Oqu(i.popularity),t.xp6(5),t.Q6J("ngForOf",i.genres),t.xp6(1),t.Q6J("src",t.lcZ(20,8,i.uri),t.uOi),t.xp6(2),t.Q6J("src",t.lcZ(22,10,i.images),t.LSH)}}const F=[{path:"",component:(()=>{class r{constructor(i,a){this.route=i,this.artistService=a}ngOnInit(){this.artist=this.route.params.pipe((0,m.z)(i=>this.getArtist(i.id)))}getArtist(i){return this.artistService.getArtist(i)}}return r.\u0275fac=function(i){return new(i||r)(t.Y36(c.gz),t.Y36(u))},r.\u0275cmp=t.Xpm({type:r,selectors:[["app-artist"]],decls:2,vars:3,consts:[["class","container",4,"ngIf"],[1,"container"],[1,"artist-title-group"],[1,"artist-title"],[1,"artist-followers-container"],[1,"artist-followers"],["matTooltipPosition","right","matTooltip","ARTIST FOLLOWERS",1,"artist-followers-icon"],[1,"artist-popularity-container"],[1,"artist-popularity"],["matTooltipPosition","right","matTooltip","ARTIST POPULARITY",1,"artist-popularity-icon"],[1,"artist-genre-container"],["matTooltipShowDelay","2000","matTooltip","Artist Genres","class","artist-genre-chip",4,"ngFor","ngForOf"],["allowtransparency","true","allow","encrypted-media",1,"artist-iframe",3,"src"],["alt","artist",1,"artist-image",3,"src"],[1,"artist-top-tracks"],["mat-tab-label",""],[1,"artist-top-tracks-container"],[1,"artist-albums-container"],["matTooltipShowDelay","2000","matTooltip","Artist Genres",1,"artist-genre-chip"],[1,"artist-top-tracks-tab"]],template:function(i,a){1&i&&(t.YNc(0,S,33,12,"mat-card",0),t.ALo(1,"async")),2&i&&t.Q6J("ngIf",t.lcZ(1,1,a.artist))},directives:[e.O5,s.a8,s.C1,s.n5,s.$j,T.Hw,x.gM,d.qn,e.sg,d.HS,f.SP,f.uX,f.uD,P,w],pipes:[e.Ov,e.JJ,e.rS,_.P,v.I],styles:[".container[_ngcontent-%COMP%]{margin:1em;max-width:100%}.artist-title[_ngcontent-%COMP%]{font-size:60px;margin-top:.5em}.artist-image[_ngcontent-%COMP%]{border-radius:20px;margin-right:1em;width:400px;height:400px}.artist-top-tracks[_ngcontent-%COMP%]{margin-top:1em}.artist-top-tracks-title[_ngcontent-%COMP%]{font-size:30px}.artist-top-tracks-container[_ngcontent-%COMP%], .artist-albums-container[_ngcontent-%COMP%]{margin-top:1em;display:flex;flex-direction:row;flex-wrap:wrap;justify-content:space-evenly}.artist-iframe[_ngcontent-%COMP%]{width:100%;margin-top:3em}.artist-break[_ngcontent-%COMP%]{flex-basis:100%;height:0}.artist-popularity-container[_ngcontent-%COMP%]{margin-top:.5em}.artist-popularity[_ngcontent-%COMP%]{margin-right:.2em;font-size:25px}.artist-popularity-icon[_ngcontent-%COMP%]{font-size:25px;color:#de541e}.artist-followers-container[_ngcontent-%COMP%]{margin-top:1em;font-size:30px}.artist-followers[_ngcontent-%COMP%]{margin-right:.2em}.artist-followers-icon[_ngcontent-%COMP%]{color:#fff275;font-size:30px}.artist-genre-container[_ngcontent-%COMP%]{margin-left:-4px;margin-top:1em}.artist-genre-chip[_ngcontent-%COMP%]{border:1px solid #1DB954;justify-content:space-evenly}.mat-card-title-group[_ngcontent-%COMP%]{display:flex;flex-direction:row-reverse;justify-content:flex-end}@media screen and (max-width: 900px){.artist-title[_ngcontent-%COMP%]{font-size:40px}.artist-image[_ngcontent-%COMP%]{max-width:200px;max-height:200px}}"]}),r})()}];let Y=(()=>{class r{}return r.\u0275fac=function(i){return new(i||r)},r.\u0275mod=t.oAB({type:r}),r.\u0275inj=t.cJS({imports:[[c.Bz.forChild(F)]]}),r})();var z=o(8205);let J=(()=>{class r{}return r.\u0275fac=function(i){return new(i||r)},r.\u0275mod=t.oAB({type:r}),r.\u0275inj=t.cJS({imports:[[Y,z.m]]}),r})()}}]);