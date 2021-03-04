import { Directive, ElementRef, AfterViewInit, Input } from '@angular/core';

@Directive({
    selector: '[appAutofocus]'
})
export class AutofocusDirective implements AfterViewInit {
    @Input()
    public appAutofocus = true;

    public constructor(private readonly element: ElementRef<HTMLElement>) {}

    public ngAfterViewInit(): void {
        if (this.element && this.element.nativeElement) {
            setTimeout(() => this.element.nativeElement.focus(), 0);
        }
    }
}
