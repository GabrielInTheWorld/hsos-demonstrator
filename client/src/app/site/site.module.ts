import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { LoginSiteComponent } from './modules/login-site/login-site.component';
import { SiteComponentsModule } from './components/site-components.module';
import { SiteRoutingModule } from './site-routing.module';
import { SiteComponent } from './site.component';
import { UIModule } from '../ui/ui.module';
import { UsersModule } from './modules/users/users.module';

@NgModule({
    exports: [SiteComponent, LoginSiteComponent],
    imports: [UIModule, SiteRoutingModule, CommonModule, SiteComponentsModule, UsersModule],
    declarations: [SiteComponent, LoginSiteComponent]
})
export class SiteModule {}
