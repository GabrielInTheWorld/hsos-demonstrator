import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthService } from './../../../core/services/auth.service';

@Component({
    selector: 'app-auth-site',
    templateUrl: './auth-site.component.html',
    styleUrls: ['./auth-site.component.scss']
})
export class AuthSiteComponent implements OnInit {
    public additionalForm: FormGroup;

    public errorMessage = '';
    public showSpinner = false;
    public authForm: FormGroup;
    public requiredAuthenticationFactors: string[] = [];

    public isVisible = false;

    private username = '';

    public constructor(
        private readonly fb: FormBuilder,
        private readonly auth: AuthService,
        private readonly router: Router,
        private readonly route: ActivatedRoute
    ) {}

    public ngOnInit(): void {
        this.route.data.subscribe(data => console.log('received data', data));
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

    public cancel(): void {
        const authForm = {};
        for (const control of Object.keys(this.authForm.controls)) {
            authForm[control] = '';
        }
        this.authForm.setValue(authForm);
        this.requiredAuthenticationFactors = [];
    }
}
