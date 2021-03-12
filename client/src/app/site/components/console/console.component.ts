import { CdkVirtualScrollViewport, ExtendedScrollToOptions } from '@angular/cdk/scrolling';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnInit,
    ViewChild
} from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { BaseComponent } from 'src/app/core/models/base.component';

@Component({
    selector: 'app-console',
    templateUrl: './console.component.html',
    styleUrls: ['./console.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConsoleComponent extends BaseComponent implements OnInit, AfterViewInit {
    @ViewChild('consoleWrapper')
    public readonly consoleWrapper: ElementRef<HTMLDivElement>;

    @ViewChild(CdkVirtualScrollViewport)
    public virtualScrollViewport?: CdkVirtualScrollViewport;

    @Input()
    public set isOpen(opened: boolean) {
        this._isOpen = opened;
        setTimeout(() => this.scrollToBottom(), 10);
    }

    public get isOpen(): boolean {
        return this._isOpen;
    }

    @Input()
    public messageObservable: Observable<string[]>;

    public messages: string[] = [];

    private _isOpen = false;

    public constructor(private cd: ChangeDetectorRef) {
        super();
    }

    public ngOnInit(): void {
        if (this.messageObservable) {
            this.subscriptions.push(
                this.messageObservable
                    .pipe(
                        map(messages => messages.join(' ')),
                        filter(message => !!message)
                    )
                    .subscribe(message => {
                        setTimeout(() => (this.messages = this.messages.concat(message)));
                        this.scrollToBottom();
                        this.cd.markForCheck();
                    })
            );
        }
    }

    public ngAfterViewInit(): void {
        this.scrollToBottom();
    }

    public trackByIndex(index: number): number {
        return index;
    }

    private scrollToBottom(): void {
        if (!this.virtualScrollViewport || !this.isOpen) {
            return;
        }
        const scrollTarget: ExtendedScrollToOptions = {
            bottom: 0,
            behavior: 'smooth'
        };
        setTimeout(() => {
            this.virtualScrollViewport.scrollTo(scrollTarget);
        }, 10);
    }
}
