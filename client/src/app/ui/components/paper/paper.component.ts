import { Component, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

export type Depth = 0 | 1 | 2 | 3 | 4 | 5;

@Component({
    selector: 'app-paper',
    templateUrl: './paper.component.html',
    styleUrls: ['./paper.component.scss']
})
export class PaperComponent implements AfterViewInit {
    @ViewChild('paperWrapper')
    public paperWrapper: ElementRef<HTMLElement>;

    @Input()
    public depth: Depth = 2;

    @Input()
    public clickable = false;

    public get classes(): string {
        return `depth--${this.depth} ${this.clickable ? 'clickable' : ''}`;
    }

    private defaultDepth: Depth = 2;

    public ngAfterViewInit(): void {
        if (this.clickable && this.paperWrapper) {
            this.defaultDepth = this.depth;
            const element = this.paperWrapper.nativeElement;
            element.addEventListener('mouseenter', () => this.elevateUp());
            element.addEventListener('mouseleave', () => this.elevateDown());
        }
    }

    private elevateUp(): void {
        this.depth = 5;
    }

    private elevateDown(): void {
        this.depth = this.defaultDepth;
    }
}
