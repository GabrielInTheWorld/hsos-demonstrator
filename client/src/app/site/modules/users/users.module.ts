import { UserDetailDialogComponent } from './components/user-detail-dialog/user-detail-dialog.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { NgModule } from '@angular/core';
import { UIModule } from 'src/app/ui/ui.module';

import { UsersDetailComponent } from './components/users-detail/users-detail.component';
import { UsersListComponent } from './components/users-list/users-list.component';
import { UsersRoutingModule } from './users-routing.module';
import { UsersCreateDialogComponent } from './components/users-create-dialog/users-create-dialog.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserAuthenticationTypeChooserComponent } from './components/user-authentication-type-chooser/user-authentication-type-chooser.component';
import { FidoDialogComponent } from './components/fido-dialog/fido-dialog.component';

const declarations = [
    UsersListComponent,
    UsersDetailComponent,
    UsersCreateDialogComponent,
    UserManagementComponent,
    UserDetailDialogComponent
];

@NgModule({
    imports: [UsersRoutingModule, UIModule],
    declarations: [...declarations, UserListComponent, UserAuthenticationTypeChooserComponent, FidoDialogComponent],
    exports: [UserManagementComponent]
})
export class UsersModule {}
