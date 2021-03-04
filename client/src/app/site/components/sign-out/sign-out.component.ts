import { AuthService } from 'src/app/core/services/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-sign-out',
    templateUrl: './sign-out.component.html',
    styleUrls: ['./sign-out.component.scss']
})
export class SignOutComponent implements OnInit {
    public constructor(public readonly auth: AuthService) {}

    public ngOnInit(): void {}
}
