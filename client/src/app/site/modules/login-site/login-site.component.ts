import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { BaseComponent } from 'src/app/core/models/base.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { FidoAuthenticatorService } from '../users/services/fido-authenticator.service';

@Component({
    selector: 'app-login-site',
    templateUrl: './login-site.component.html',
    styleUrls: ['./login-site.component.scss']
})
export class LoginSiteComponent extends BaseComponent implements OnInit {
    public loginForm: FormGroup;
    public additionalForm: FormGroup;

    public errorMessage = '';
    public showSpinner = false;
    public authForm: FormGroup;
    public requiredAuthenticationFactors: string[] = [];
    public requiredAuthenticationData: { [key: string]: any } = {};

    public isVisible = false;

    public username = '';

    public fidoCredentials: any;

    public constructor(
        private readonly fb: FormBuilder,
        private readonly auth: AuthService,
        private readonly fido: FidoAuthenticatorService
    ) {
        super();
    }

    public ngOnInit(): void {
        this.loginForm = this.fb.group({
            username: ['admin', Validators.required]
        });
    }

    public async login(): Promise<void> {
        this.showSpinner = true;
        if (this.loginForm.invalid) {
            return;
        }
        this.username = this.loginForm.get('username').value;
        const failure = await this.auth.login({ username: this.username });
        if (failure && failure.reason) {
            this.requiredAuthenticationFactors = failure.reason;
            this.requiredAuthenticationData = failure.data;
            this.prepareAuthForm();
            await this.prepareFido();
        }
        this.showSpinner = false;
    }

    public async confirmLogin(): Promise<void> {
        if (this.authForm.invalid) {
            return;
        }
        const failure = await this.auth.confirmAuthentication(this.username, {
            ...this.authForm.value
        });
        if (failure) {
            this.errorMessage = failure.message;
        }
    }

    public clear(): void {
        this.loginForm.setValue({
            username: ''
        });
    }

    public cancel(): void {
        const authForm = {};
        for (const control of Object.keys(this.authForm.controls)) {
            authForm[control] = '';
        }
        this.authForm.setValue(authForm);
        this.requiredAuthenticationFactors = [];
    }

    private prepareAuthForm(): void {
        const formGroup = {};
        for (const factor of this.requiredAuthenticationFactors) {
            formGroup[factor] = ['', Validators.required];
        }
        this.authForm = this.fb.group(formGroup);
    }

    private async prepareFido(): Promise<void> {
        if (this.requiredAuthenticationData.fido) {
            const credentials = await this.fido.login(this.requiredAuthenticationData.fido);
            console.log('credentials', credentials);
            this.fidoCredentials = credentials;
            this.authForm.patchValue({ fido: credentials });
        }
    }
}
