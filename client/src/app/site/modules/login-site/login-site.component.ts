import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FidoAuthenticatorService } from '../users/services/fido-authenticator.service';
import { BaseComponent } from 'src/app/core/models/base.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { Logger } from 'src/app/core/utils/logger';
import { AuthenticationTypeVerboseName } from '../users/services/users.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
        private readonly fido: FidoAuthenticatorService,
        private readonly matSnackbar: MatSnackBar
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
        Logger.next(`Sende Anmeldeanfrage mit Benutzernamen ${this.username}`);
        const failure = await this.auth.login({ username: this.username });
        if (failure && failure.reason) {
            Logger.next(
                `Für eine Authentifizierung fehlen folgende Faktoren: ${this.getVerboseReasons(failure.reason)}`
            );
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
            this.matSnackbar.open(this.errorMessage, 'Okay', { duration: 2000 });
        }
    }

    public clear(): void {
        this.loginForm.setValue({
            username: ''
        });
    }

    public cancel(): void {
        Logger.next('Abbruch');
        const authForm = {};
        for (const control of Object.keys(this.authForm.controls)) {
            authForm[control] = '';
        }
        this.authForm.setValue(authForm);
        this.fidoCredentials = null;
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
            Logger.next('FIDO-Challenge erhalten. Erstelle Response.');
            const credentials = await this.fido.login(this.requiredAuthenticationData.fido);
            this.fidoCredentials = credentials;
            this.authForm.patchValue({ fido: credentials });
        }
    }

    private getVerboseReasons(reasons: string[]): string {
        return reasons.map(reason => AuthenticationTypeVerboseName[reason]).join(', ');
    }
}
