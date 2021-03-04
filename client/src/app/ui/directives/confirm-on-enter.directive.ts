import { Directive, ElementRef, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';

@Directive({
    selector: '[appConfirmOnEnter]'
})
export class ConfirmOnEnterDirective implements AfterViewInit {
    @Output()
    public appConfirmOnEnter = new EventEmitter<void>();

    public constructor(private readonly element: ElementRef<HTMLElement>) {}

    public ngAfterViewInit(): void {
        if (this.element && this.element.nativeElement) {
            this.element.nativeElement.addEventListener('keypress', event => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    event.stopPropagation();
                    this.appConfirmOnEnter.emit();
                }
            });
        }
    }
}
