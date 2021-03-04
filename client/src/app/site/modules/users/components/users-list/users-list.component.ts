import { UsersCreateDialogComponent } from './../users-create-dialog/users-create-dialog.component';
import { Component, OnInit } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-users-list',
    templateUrl: './users-list.component.html',
    styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements OnInit {
    public constructor(
        // public readonly router: RouterService,
        private readonly dialog: MatDialog // private readonly userService: UsersService
    ) {}

    public ngOnInit(): void {
        this.onSync();
    }

    public async onAdd(): Promise<void> {
        const dialogRef = this.dialog.open(UsersCreateDialogComponent);
        const result = await dialogRef.afterClosed().toPromise();
        console.log('result of dialog', result);
    }

    public onSync(): void {
        // this.userService.getAllUsers();
    }
}
