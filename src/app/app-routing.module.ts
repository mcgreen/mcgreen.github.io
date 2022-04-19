import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('@components/login/login.module').then(m => m.LoginModule),
  },
  {
    path: 'home',
    loadChildren: () => import('@components/home/home.module').then(m => m.HomeModule),
  },
  {
    path: 'insights',
    loadChildren: () => import('@components/insights/insights.module').then(m => m.InsightsModule),
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
  ],
  exports: []
})
export class AppRoutingModule {
}
