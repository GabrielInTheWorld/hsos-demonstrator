import { AuthenticationTypeVerboseName } from './../../services/users.service';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { debounceTime } from 'rxjs/operators';

import { BaseComponent } from './../../../../../core/models/base.component';
import { User } from './../../models/user';

export interface UserDetailDialogData {
    user?: User;
    authenticationTypes: string[];
    [key: string]: any;
}

@Component({
    selector: 'app-user-detail-dialog',
    templateUrl: './user-detail-dialog.component.html',
    styleUrls: ['./user-detail-dialog.component.scss']
})
export class UserDetailDialogComponent extends BaseComponent implements OnInit {
    public userForm: FormGroup;

    public get user(): User | undefined {
        return this.data.user;
    }

    public get username(): string {
        return this._username;
    }

    public get authenticationTypes(): string[] {
        return this.data.authenticationTypes;
    }

    public get selectedAuthenticationTypes(): string[] {
        return this._selectedTypes;
    }

    public authTypeForm: { [key: string]: string } = {};

    private _selectedTypes: string[] = [];
    private _username = '';

    public constructor(
        public dialogRef: MatDialogRef<UserDetailDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private readonly data: UserDetailDialogData,
        private readonly fb: FormBuilder
    ) {
        super();
    }

    public ngOnInit(): void {
        const form = {
            username: [this.user?.username || '', Validators.required],
            authenticationTypes: [this.user?.authenticationTypes || [], Validators.required]
        };
        if (this.user) {
            this._selectedTypes = this.user.authenticationTypes;
        }
        this.userForm = this.fb.group(form);
        this.subscriptions.push(
            this.userForm
                .get('username')
                .valueChanges.pipe(debounceTime(200))
                .subscribe(name => (this._username = name)),
            this.userForm
                .get('authenticationTypes')
                .valueChanges.subscribe(currentValue => (this._selectedTypes = currentValue))
        );
    }

    public onSubmit(): void {
        if (!this.isValid()) {
            return;
        }
        const dialogResult = { userId: this.user?.userId, ...this.userForm.value, ...this.authTypeForm };
        this.dialogRef.close(dialogResult);
    }

    public isValid(): boolean {
        const dirtyAuthTypes = this.selectedAuthenticationTypes.filter(type => !this.authTypeForm[type]);
        return this.userForm.valid && !dirtyAuthTypes.length;
    }

    public getVerboseAuthenticationType(type: string): string {
        return AuthenticationTypeVerboseName[type];
    }
}
