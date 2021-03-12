import { NgModule } from '@angular/core';

import { FidoDialogComponent } from './components/fido-dialog/fido-dialog.component';
import { UIModule } from 'src/app/ui/ui.module';
import { UserAuthenticationTypeChooserComponent } from './components/user-authentication-type-chooser/user-authentication-type-chooser.component';
import { UserDetailDialogComponent } from './components/user-detail-dialog/user-detail-dialog.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { UsersRoutingModule } from './users-routing.module';

const declarations = [
    UserManagementComponent,
    UserDetailDialogComponent,
    UserListComponent,
    UserAuthenticationTypeChooserComponent,
    FidoDialogComponent
];

@NgModule({
    imports: [UsersRoutingModule, UIModule],
    declarations: [...declarations],
    exports: [UserManagementComponent]
})
export class UsersModule {}
