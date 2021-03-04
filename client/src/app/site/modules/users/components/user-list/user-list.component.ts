import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

import { User } from './../../models/user';
import { AuthenticationTypeVerboseName } from '../../services/users.service';

@Component({
    selector: 'app-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
    @Input()
    public users: User[] = [];

    @Output()
    public editUser = new EventEmitter<User>();

    @Output()
    public deleteUser = new EventEmitter<User>();

    public constructor() {}

    public ngOnInit(): void {}

    public getAuthenticationTypeVerboseName(type: string): string {
        return AuthenticationTypeVerboseName[type];
    }
}
