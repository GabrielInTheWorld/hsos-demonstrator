import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { BaseComponent } from './../../../../../core/models/base.component';
import { PromptDialogService } from './../../../../../ui/services/prompt-dialog.service';
import { User } from './../../models/user';
import { UserDetailDialogComponent } from '../user-detail-dialog/user-detail-dialog.component';
import { UsersService } from '../../services/users.service';

@Component({
    selector: 'app-user-management',
    templateUrl: './user-management.component.html',
    styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent extends BaseComponent implements OnInit, OnDestroy {
    public get users(): User[] {
        return this._users;
    }

    private _users: User[] = [];

    public constructor(
        private readonly userService: UsersService,
        private readonly dialog: MatDialog,
        private readonly promptService: PromptDialogService
    ) {
        super();
    }

    public ngOnInit(): void {
        this.subscriptions.push(this.userService.getAllUsersObservable().subscribe(users => (this._users = users)));
    }

    public ngOnDestroy(): void {}

    public async createUser(): Promise<void> {
        const result = await this.showUserDetailDialog();
        await this.userService.create(result);
    }

    public async editUser(user: User): Promise<void> {
        console.log('user', user);
        const detailedUser = await this.userService.getUser(user.userId);
        const update = await this.showUserDetailDialog(detailedUser);
        await this.userService.update(detailedUser.userId, update);
    }

    public async deleteUser(user: User): Promise<void> {
        console.log('user', user);
        const answer = await this.promptService.open(
            `Benutzer ${user.username} löschen`,
            'Möchten Sie den Benutzer löschen?'
        );
        if (answer) {
            await this.userService.delete(user);
        }
    }

    public async resetDatabase(): Promise<void> {
        const answer = await this.promptService.open(
            'Komplette Datenbank zurücksetzen',
            `Wollen Sie wirklich die komplette Datenbank zurücksetzen?\n\r
            Sämtliche Benutzer werden gelöscht und ein Standardbenutzer "admin" wird angelegt.`
        );
        if (answer) {
            await this.userService.resetDatabase();
        }
    }

    private async showUserDetailDialog(user?: User): Promise<Partial<User>> {
        const dialogRef = this.dialog.open(UserDetailDialogComponent, {
            width: '400px',
            disableClose: true,
            data: {
                authenticationTypes: this.userService.getAuthenticationTypesInstantly(),
                user
            }
        });
        const result = await dialogRef.afterClosed().toPromise();
        console.log('result', result);
        return result;
    }
}
