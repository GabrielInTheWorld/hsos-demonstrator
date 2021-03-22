import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Base32 } from 'base-coding';

import { BaseComponent } from './../../../../../core/models/base.component';
import { CryptoService } from './../../../../../core/services/crypto.service';
import { Authentication } from 'src/app/core/services/auth.service';
import { User } from './../../models/user';
import { Logger } from 'src/app/core/utils/logger';

export interface AuthTypeValue {
    email?: string;
    totp?: string;
    password?: string;
}

@Component({
    selector: 'app-user-authentication-type-chooser',
    templateUrl: './user-authentication-type-chooser.component.html',
    styleUrls: ['./user-authentication-type-chooser.component.scss']
})
export class UserAuthenticationTypeChooserComponent extends BaseComponent implements OnInit {
    public readonly authenticationModel = {
        // platform: 'Betriebssystemabhängige Authentifizierung', // Currently not working
        'cross-platform': 'Authentifizierung mittels externem Token'
    };

    @Input()
    public set selectedAuthenticationTypes(types: string[]) {
        this.selectedTypes = types;
        this.prepareTotp();
    }

    public get selectedAuthenticationTypes(): string[] {
        return this.selectedTypes;
    }

    @Input()
    public set username(value: string) {
        this._username = value;
        this.prepareTotp();
    }

    public get username(): string {
        return this._username;
    }

    @Input()
    public user: User;

    @Output()
    public formChange = new EventEmitter<AuthTypeValue>();

    public authTypeForm: FormGroup;

    public get totpUri(): string {
        return this.authTypeForm.get('totp').value;
    }

    public isVisible = false;

    private selectedTypes: string[] = [];

    private _username = '';

    public constructor(private readonly fb: FormBuilder, private readonly crypto: CryptoService) {
        super();
    }

    public ngOnInit(): void {
        this.authTypeForm = this.fb.group({
            email: [this.user?.email.email || '', Validators.email],
            totp: this.user?.totp.raw || '',
            password: this.user?.password || '',
            fido: 'cross-platform'
        });
        this.formChange.emit(this.authTypeForm.value); // emitting initial value
        this.subscriptions.push(this.authTypeForm.valueChanges.subscribe(value => this.formChange.emit(value)));
    }

    public getValue(): AuthTypeValue {
        return this.authTypeForm.value;
    }

    private prepareTotp(): void {
        if (!this.selectedTypes.includes('totp')) {
            return;
        }
        const secret = this.crypto.generateRandomString(128);
        const totpUri = Authentication.otpToUri({
            type: 'totp',
            to: this.username,
            issuer: 'Demonstrator',
            secret: Base32.encode(secret),
            period: 30,
            digits: 6
        });
        Logger.next(`Erstelle TOTP-Uri:`, totpUri);
        if (!this.authTypeForm) {
            console.warn('Auth type form is not yet available');
            return;
        }
        this.authTypeForm.patchValue({ totp: totpUri });
    }
}
