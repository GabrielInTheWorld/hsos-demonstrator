import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { Logger } from '../core/utils/logger';

import { HeadbarService } from '../ui/services/headbar.service';
import { ConsoleService } from './services/console.service';

@Component({
    selector: 'app-site',
    templateUrl: './site.component.html',
    styleUrls: ['./site.component.scss']
})
export class SiteComponent implements AfterViewInit {
    public title = 'homepage';

    @ViewChild('wrapper')
    public wrapper: ElementRef<HTMLElement>;

    public get clientConsole(): Observable<any[]> {
        return Logger.getLogMessagesObservable();
    }

    public get serverConsole(): Observable<any[]> {
        return this.serverConsoleService.getLogServerMessagesObservable();
    }

    public constructor(
        public readonly headbar: HeadbarService,
        private readonly serverConsoleService: ConsoleService
    ) {}

    public ngAfterViewInit(): void {}

    public changeWidth(width: number): void {
        if (!this.wrapper) {
            return;
        }
        const widthString = `${width}px`;
        this.wrapper.nativeElement.style.width = `calc(100% - ${widthString})`;
        this.wrapper.nativeElement.style.left = widthString;
    }
}
