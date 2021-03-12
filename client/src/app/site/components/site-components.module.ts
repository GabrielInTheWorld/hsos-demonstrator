import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { UIModule } from 'src/app/ui/ui.module';

import { ConsoleComponent } from './console/console.component';

const components = [ConsoleComponent];

@NgModule({
    declarations: [...components],
    imports: [UIModule, CommonModule],
    exports: [...components]
})
export class SiteComponentsModule {}
