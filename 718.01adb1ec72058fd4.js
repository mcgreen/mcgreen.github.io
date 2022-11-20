"use strict";(self.webpackChunksdash=self.webpackChunksdash||[]).push([[718],{3718:(J,m,s)=>{s.r(m),s.d(m,{HomeModule:()=>S});var p=s(4996),e=s(5e3),f=s(5043),u=s(3121),h=s(4004),v=s(8767);let w=(()=>{class t{constructor(n){this.http=n,this.newReleaseUrl=u.g.API_URL+u.g.API_NEW_RELEASES+"?limit=50"}getNewReleases(){return this.http.get(this.newReleaseUrl).pipe((0,h.U)(n=>n.albums.items.map(({id:i,images:l,name:F,artists:Z,type:P,album_type:I})=>({id:i,images:l,name:F,artists:Z,type:P,album_type:I}))))}}return t.\u0275fac=function(n){return new(n||t)(e.LFG(v.q))},t.\u0275prov=e.Yz7({token:t,factory:t.\u0275fac,providedIn:"root"}),t})();var d=s(9714);let y=(()=>{class t{constructor(n){this.store=n,console.log("meat")}}return t.\u0275fac=function(n){return new(n||t)(e.LFG(d.y))},t.\u0275prov=e.Yz7({token:t,factory:t.\u0275fac,providedIn:"root"}),t})();var r=s(9808),c=s(9224),g=s(9417),C=s(1413);function x(t,o){if(1&t){const n=e.EpF();e.TgZ(0,"mat-card-subtitle",3),e.NdJ("click",function(){e.CHM(n);const i=e.oxw(2);return i.goToArtist(i.item)}),e._uU(1),e.qZA()}if(2&t){const n=o.$implicit;e.xp6(1),e.Oqu(n.name)}}function _(t,o){if(1&t){const n=e.EpF();e.TgZ(0,"mat-card",2)(1,"mat-card-title",3),e.NdJ("click",function(){e.CHM(n);const i=e.oxw();return i.goToAlbum(i.item)}),e._uU(2),e.qZA(),e.YNc(3,x,2,1,"mat-card-subtitle",4),e.TgZ(4,"img",5),e.NdJ("click",function(){e.CHM(n);const i=e.oxw();return i.goToAlbum(i.item)}),e.ALo(5,"image"),e.qZA(),e.TgZ(6,"mat-chip-list")(7,"mat-chip",6),e._uU(8),e.ALo(9,"uppercase"),e.qZA()()()}if(2&t){const n=e.oxw();e.xp6(2),e.Oqu(n.item.name),e.xp6(1),e.Q6J("ngForOf",n.item.artists),e.xp6(1),e.Q6J("src",e.lcZ(5,4,n.item.images),e.LSH),e.xp6(4),e.Oqu(e.lcZ(9,6,n.item.album_type))}}let R=(()=>{class t{constructor(n){this.router=n}goToAlbum(n){this.router.navigate(["/album",n.id])}goToArtist(n){this.router.navigate(["/artist",n.artists[0].id])}}return t.\u0275fac=function(n){return new(n||t)(e.Y36(p.F0))},t.\u0275cmp=e.Xpm({type:t,selectors:[["app-new-releases"]],inputs:{item:"item"},decls:2,vars:1,consts:[[1,"new-releases-container"],["class","new-release-item mat-elevation-z10",4,"ngIf"],[1,"new-release-item","mat-elevation-z10"],[3,"click"],[3,"click",4,"ngFor","ngForOf"],["mat-card-image","","alt","Album image",1,"new-release-item-img",3,"src","click"],[1,"new-release-item-chip"]],template:function(n,a){1&n&&(e.TgZ(0,"div",0),e.YNc(1,_,10,8,"mat-card",1),e.qZA()),2&n&&(e.xp6(1),e.Q6J("ngIf",a.item))},directives:[r.O5,c.a8,c.n5,r.sg,c.$j,c.G2,g.qn,g.HS],pipes:[C.I,r.gd],styles:[".new-releases-container[_ngcontent-%COMP%]{display:inline-flex;flex-direction:row;justify-content:space-evenly;height:100%}.new-release-item[_ngcontent-%COMP%]{display:flex;flex-direction:column;margin:1em;width:250px;height:300px}.new-release-item-img[_ngcontent-%COMP%]{max-width:200px;max-height:200px;margin-left:1.5em}.new-release-item-img[_ngcontent-%COMP%]:hover{cursor:pointer}.new-release-item-chip[_ngcontent-%COMP%]{justify-self:flex-end;border:1px solid #1DB954}.mat-chip-list-wrapper[_ngcontent-%COMP%]{justify-content:center!important}.mat-card-title[_ngcontent-%COMP%]{cursor:pointer}.mat-card-title[_ngcontent-%COMP%]:hover{color:#1db954}.mat-card-subtitle[_ngcontent-%COMP%]{cursor:pointer}.mat-card-subtitle[_ngcontent-%COMP%]:hover{color:#1db954}"]}),t})();var N=s(4171);function A(t,o){1&t&&e._UZ(0,"app-new-releases",3),2&t&&e.Q6J("item",o.$implicit)}function O(t,o){if(1&t&&(e.ynx(0),e.YNc(1,A,1,1,"app-new-releases",2),e.ALo(2,"orderBy"),e.BQk()),2&t){const n=o.ngIf;e.xp6(1),e.Q6J("ngForOf",e.xi3(2,1,n,"album_type"))}}const M=[{path:"",component:(()=>{class t{constructor(n,a,i,l){this.logger=n,this.newReleasesService=a,this.store=i,this.playerService=l}ngOnInit(){this.newReleases=this.newReleasesService.getNewReleases()}}return t.\u0275fac=function(n){return new(n||t)(e.Y36(f.m),e.Y36(w),e.Y36(d.y),e.Y36(y))},t.\u0275cmp=e.Xpm({type:t,selectors:[["app-home"]],decls:5,vars:3,consts:[[1,"section-title"],[4,"ngIf"],[3,"item",4,"ngFor","ngForOf"],[3,"item"]],template:function(n,a){1&n&&(e.TgZ(0,"section")(1,"h1",0),e._uU(2,"New Releases"),e.qZA(),e.YNc(3,O,3,4,"ng-container",1),e.ALo(4,"async"),e.qZA()),2&n&&(e.xp6(3),e.Q6J("ngIf",e.lcZ(4,1,a.newReleases)))},directives:[r.O5,r.sg,R],pipes:[r.Ov,N.d],styles:[""]}),t})()}];let T=(()=>{class t{}return t.\u0275fac=function(n){return new(n||t)},t.\u0275mod=e.oAB({type:t}),t.\u0275inj=e.cJS({imports:[[p.Bz.forChild(M)]]}),t})();var H=s(8205);let S=(()=>{class t{}return t.\u0275fac=function(n){return new(n||t)},t.\u0275mod=e.oAB({type:t}),t.\u0275inj=e.cJS({imports:[[H.m,T]]}),t})()}}]);