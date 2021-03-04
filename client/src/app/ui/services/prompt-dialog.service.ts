import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { PromptDialogComponent } from './../components/prompt-dialog/prompt-dialog.component';

@Injectable({
    providedIn: 'root'
})
export class PromptDialogService {
    public constructor(private readonly dialog: MatDialog) {}

    public async open(title: string, text?: string): Promise<boolean> {
        const dialogRef = this.dialog.open(PromptDialogComponent, {
            width: '400px',
            disableClose: true,
            data: { title, text }
        });
        return dialogRef.afterClosed().toPromise<boolean>();
    }
}
