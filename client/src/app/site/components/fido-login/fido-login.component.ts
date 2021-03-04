import { Component, Input, OnInit } from '@angular/core';
import { HttpService } from 'src/app/core/services/http.service';

@Component({
    selector: 'app-fido-login',
    templateUrl: './fido-login.component.html',
    styleUrls: ['./fido-login.component.scss']
})
export class FidoLoginComponent implements OnInit {
    @Input()
    public username: string;

    @Input()
    public data: { [key: string]: any } = {};

    public constructor(private readonly http: HttpService) {}

    public ngOnInit(): void {}

    private async confirmLogin(): Promise<void> {
        if (this.data.fido) {
            const credentials = await navigator.credentials.get(this.data.fido);
            this.http.post('fido-login-confirm');
        }
    }
}
