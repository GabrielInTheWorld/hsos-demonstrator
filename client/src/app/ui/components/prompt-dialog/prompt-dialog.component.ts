import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

interface PromptDialogData {
    title: string;
    text?: string;
}

@Component({
    selector: 'app-prompt-dialog',
    templateUrl: './prompt-dialog.component.html',
    styleUrls: ['./prompt-dialog.component.scss']
})
export class PromptDialogComponent implements OnInit {
    public constructor(
        public dialogRef: MatDialogRef<PromptDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: PromptDialogData
    ) {}

    public ngOnInit(): void {}
}
