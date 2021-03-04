import { HeadbarService } from './../../../ui/services/headbar.service';
import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { BaseComponent } from 'src/app/core/models/base.component';

import { ConsoleService } from '../../services/console.service';

const SCROLL_BAR_WIDTH = 15;

@Component({
    selector: 'app-console',
    templateUrl: './console.component.html',
    styleUrls: ['./console.component.scss']
})
export class ConsoleComponent extends BaseComponent implements OnInit, AfterViewInit {
    @ViewChild('consoleWrapper')
    public readonly consoleWrapper: ElementRef<HTMLDivElement>;

    @Output()
    public changeWidth = new EventEmitter<number>();

    public get isOpen(): boolean {
        return this.headbarService.isConsoleOpen;
    }

    public get messages(): string[] {
        return this._messages;
    }

    private _messages: string[] = [];

    public constructor(
        private readonly consoleService: ConsoleService,
        private readonly headbarService: HeadbarService
    ) {
        super();
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            this.consoleService.getMessageObservable().subscribe(messages => {
                const copy = [...messages];
                this._messages = copy.reverse();
            })
        );
    }

    public ngAfterViewInit(): void {
        if (!this.consoleWrapper) {
            return;
        }
        this.changeWidth.emit(this.consoleWrapper.nativeElement.clientWidth + SCROLL_BAR_WIDTH);
    }
}
