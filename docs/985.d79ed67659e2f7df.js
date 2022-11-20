"use strict";(self.webpackChunksdash=self.webpackChunksdash||[]).push([[985],{8985:(T,c,o)=>{o.r(c),o.d(c,{HomeModule:()=>F});var f=o(5020),e=o(5e3),d=o(5043),p=o(3121),h=o(4004),w=o(8767);let u=(()=>{class t{constructor(n){this.http=n,this.newReleaseUrl=p.g.API_URL+p.g.API_NEW_RELEASES+"?limit=50"}getNewReleases(){return this.http.get(this.newReleaseUrl).pipe((0,h.U)(n=>n.albums.items.map(({id:a,images:m,name:P,artists:M,type:S,album_type:I})=>({id:a,images:m,name:P,artists:M,type:S,album_type:I}))))}}return t.\u0275fac=function(n){return new(n||t)(e.LFG(w.q))},t.\u0275prov=e.Yz7({token:t,factory:t.\u0275fac,providedIn:"root"}),t})();var v=o(7078),i=o(9808),l=o(9224),g=o(9417);let y=(()=>{class t{transform(n){return n&&0!=n.length?n.length>0?n[0].url:void 0:"assets/default-image.png"}}return t.\u0275fac=function(n){return new(n||t)},t.\u0275pipe=e.Yjl({name:"image",type:t,pure:!0}),t})();function R(t,s){if(1&t&&(e.TgZ(0,"mat-card-subtitle"),e._uU(1),e.qZA()),2&t){const n=s.$implicit;e.xp6(1),e.Oqu(n.name)}}function x(t,s){if(1&t&&(e.TgZ(0,"mat-card",2)(1,"mat-card-title"),e._uU(2),e.qZA(),e.YNc(3,R,2,1,"mat-card-subtitle",3),e._UZ(4,"img",4),e.ALo(5,"image"),e.TgZ(6,"mat-chip-list")(7,"mat-chip",5),e._uU(8),e.ALo(9,"uppercase"),e.qZA()()()),2&t){const n=e.oxw();e.xp6(2),e.Oqu(n.item.name),e.xp6(1),e.Q6J("ngForOf",n.item.artists),e.xp6(1),e.Q6J("src",e.lcZ(5,4,n.item.images),e.LSH),e.xp6(4),e.Oqu(e.lcZ(9,6,n.item.album_type))}}let C=(()=>{class t{constructor(n){this.newReleaseService=n}}return t.\u0275fac=function(n){return new(n||t)(e.Y36(u))},t.\u0275cmp=e.Xpm({type:t,selectors:[["app-new-releases"]],inputs:{item:"item"},decls:2,vars:1,consts:[[1,"new-releases-container"],["class","new-release-item mat-elevation-z10",4,"ngIf"],[1,"new-release-item","mat-elevation-z10"],[4,"ngFor","ngForOf"],["mat-card-image","","alt","Album image",1,"new-release-item-img",3,"src"],[1,"new-release-item-chip"]],template:function(n,r){1&n&&(e.TgZ(0,"div",0),e.YNc(1,x,10,8,"mat-card",1),e.qZA()),2&n&&(e.xp6(1),e.Q6J("ngIf",r.item))},directives:[i.O5,l.a8,l.n5,i.sg,l.$j,l.G2,g.qn,g.HS],pipes:[y,i.gd],styles:[".new-releases-container[_ngcontent-%COMP%]{display:inline-flex;flex-direction:row;justify-content:space-evenly;height:100%}.new-release-item[_ngcontent-%COMP%]{display:flex;flex-direction:column;margin:1em;width:250px;height:300px}.new-release-item-img[_ngcontent-%COMP%]{max-width:200px;max-height:200px;margin-left:1.5em}.new-release-item-chip[_ngcontent-%COMP%]{justify-self:flex-end;border:1px solid #1DB954}.mat-chip-list-wrapper[_ngcontent-%COMP%]{justify-content:center!important}"]}),t})(),N=(()=>{class t{transform(n,r){return n.sort((a,m)=>a[r]<m[r]?-1:a[r]>m[r]?1:0),n}}return t.\u0275fac=function(n){return new(n||t)},t.\u0275pipe=e.Yjl({name:"orderBy",type:t,pure:!0}),t})();function O(t,s){1&t&&e._UZ(0,"app-new-releases",2),2&t&&e.Q6J("item",s.$implicit)}const A=[{path:"",component:(()=>{class t{constructor(n,r,a){this.logger=n,this.newReleasesService=r,this.store=a,this.newReleases=[],this.logger.log(this.store.value.access_token)}ngOnInit(){this.getNewReleases()}getNewReleases(){this.newReleasesService.getNewReleases().subscribe(n=>{this.newReleases=n})}}return t.\u0275fac=function(n){return new(n||t)(e.Y36(d.m),e.Y36(u),e.Y36(v.y))},t.\u0275cmp=e.Xpm({type:t,selectors:[["app-home"]],decls:5,vars:4,consts:[[1,"section-title"],[3,"item",4,"ngFor","ngForOf"],[3,"item"]],template:function(n,r){1&n&&(e.TgZ(0,"section")(1,"h1",0),e._uU(2,"New Releases"),e.qZA(),e.YNc(3,O,1,1,"app-new-releases",1),e.ALo(4,"orderBy"),e.qZA()),2&n&&(e.xp6(3),e.Q6J("ngForOf",e.xi3(4,1,r.newReleases,"album_type")))},directives:[i.sg,C],pipes:[N],styles:[""]}),t})()}];let H=(()=>{class t{}return t.\u0275fac=function(n){return new(n||t)},t.\u0275mod=e.oAB({type:t}),t.\u0275inj=e.cJS({imports:[[f.Bz.forChild(A)]]}),t})();var Z=o(4466);let F=(()=>{class t{}return t.\u0275fac=function(n){return new(n||t)},t.\u0275mod=e.oAB({type:t}),t.\u0275inj=e.cJS({imports:[[Z.m,H]]}),t})()}}]);