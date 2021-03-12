import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface FidoDialogData {
    title: string;
    content: string;
}

@Component({
    selector: 'app-fido-dialog',
    templateUrl: './fido-dialog.component.html',
    styleUrls: ['./fido-dialog.component.scss']
})
export class FidoDialogComponent {
    public constructor(
        @Inject(MAT_DIALOG_DATA) public data: FidoDialogData,
        public readonly dialogRef: MatDialogRef<FidoDialogComponent>
    ) {}
}
