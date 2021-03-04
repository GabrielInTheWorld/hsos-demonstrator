import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { FidoAuthenticatorService } from './../../services/fido-authenticator.service';

interface FidoDialogData {
    username: string;
    userId?: string;
}

@Component({
    selector: 'app-fido-dialog',
    templateUrl: './fido-dialog.component.html',
    styleUrls: ['./fido-dialog.component.scss']
})
export class FidoDialogComponent implements OnInit {
    public constructor(
        @Inject(MAT_DIALOG_DATA) public data: FidoDialogData,
        public readonly dialogRef: MatDialogRef<FidoDialogComponent>,
        private readonly fidoService: FidoAuthenticatorService
    ) {}

    public ngOnInit(): void {
        this.register();
    }

    public retry(): void {
        this.register();
    }

    private register(): void {
        try {
            this.fidoService.register(this.data.username, this.data.userId);
        } catch (e) {
            console.log('error while registering:', e);
        }
    }
}
