import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import QrCodeStyling from 'qr-code-styling';

@Component({
    selector: 'app-qr-code',
    templateUrl: './qr-code.component.html',
    styleUrls: ['./qr-code.component.scss']
})
export class QrCodeComponent implements OnInit {
    @ViewChild('canvas', { static: true })
    public canvasWrapper: ElementRef<HTMLElement>;

    @Input()
    public set value(v: string) {
        this._value = v;
        this.prepareQrCode();
    }

    public get value(): string {
        return this._value;
    }

    private _value: string;
    private _changed = false;

    public constructor() {}

    public ngOnInit(): void {
        this.prepareQrCode();
    }

    private prepareQrCode(): void {
        if (this._changed) {
            this.canvasWrapper.nativeElement.removeChild(this.canvasWrapper.nativeElement.firstChild);
        }
        const qrCode: any = new QrCodeStyling({
            data: this.value,
            width: 200,
            height: 200
        });
        qrCode.append(this.canvasWrapper.nativeElement);
        this._changed = true;
    }
}
