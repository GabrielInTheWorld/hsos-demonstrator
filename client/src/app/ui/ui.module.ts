import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { HeadbarComponent } from './components/headbar/headbar.component';
import { IndicatorComponent } from './components/indicator/indicator.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { MaterialModule } from './library/material.module';
import { PaperComponent } from './components/paper/paper.component';
import { GridComponent } from './components/grid/grid.component';
import { CellComponent } from './components/cell/cell.component';
import { QrCodeComponent } from './components/qr-code/qr-code.component';
import { PromptDialogComponent } from './components/prompt-dialog/prompt-dialog.component';
import { ConfirmOnEnterDirective } from './directives/confirm-on-enter.directive';
import { AutofocusDirective } from './directives/autofocus.directive';

const components = [
    IndicatorComponent,
    LoadingSpinnerComponent,
    HeadbarComponent,
    PaperComponent,
    GridComponent,
    CellComponent,
    QrCodeComponent,
    ConfirmOnEnterDirective,
    AutofocusDirective
];

@NgModule({
    imports: [CommonModule, MaterialModule],
    exports: [MaterialModule, ...components],
    declarations: [...components, PromptDialogComponent]
})
export class UIModule {}
