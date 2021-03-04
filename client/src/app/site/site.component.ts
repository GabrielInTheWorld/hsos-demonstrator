import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
    selector: 'app-site',
    templateUrl: './site.component.html',
    styleUrls: ['./site.component.scss']
})
export class SiteComponent implements AfterViewInit {
    public title = 'homepage';

    @ViewChild('wrapper')
    public wrapper: ElementRef<HTMLElement>;

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
