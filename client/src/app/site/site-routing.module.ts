import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthSiteComponent } from './modules/auth-site/auth-site.component';
import { AuthGuard } from '../core/guards/auth.guard';
import { LoginSiteComponent } from './modules/login-site/login-site.component';
import { SiteComponent } from './site.component';

const routes: Routes = [
    {
        path: '',
        component: SiteComponent,
        children: [
            {
                path: '',
                loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'auth',
                pathMatch: 'full',
                component: AuthSiteComponent
            },
            {
                path: 'sign-in',
                pathMatch: 'full',
                component: LoginSiteComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SiteRoutingModule {}
