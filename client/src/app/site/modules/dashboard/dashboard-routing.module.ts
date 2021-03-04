import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard.component';

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: DashboardComponent
    },
    {
        path: 'callback',
        pathMatch: 'full',
        component: DashboardComponent
    }
    // {
    //     path: 'users',
    //     pathMatch: 'full',
    //     loadChildren: () => import('../users/users.module').then(m => m.UsersModule)
    // },
    // {
    //     path: 'settings',
    //     pathMatch: 'full',
    //     loadChildren: () => import('../settings/settings.module').then(m => m.SettingsModule)
    // }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DashboardRoutingModule {}
