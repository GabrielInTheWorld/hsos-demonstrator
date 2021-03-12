import { HeadbarService } from './../../services/headbar.service';
import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';

@Component({
    selector: 'app-headbar',
    templateUrl: './headbar.component.html',
    styleUrls: ['./headbar.component.scss']
})
export class HeadbarComponent implements OnInit {
    @Input()
    public hasLeftIcon = false;

    @Input()
    public leftIcon = 'arrow_back_ios';

    @Output()
    public clickLeftIcon = new EventEmitter<void>();

    @Output()
    public add = new EventEmitter<void>();

    public get isServerConsoleOpen(): boolean {
        return this.headbarService.isServerConsoleOpen;
    }

    public get isClientConsoleOpen(): boolean {
        return this.headbarService.isClientConsoleOpen;
    }

    public constructor(private headbarService: HeadbarService) {}

    public ngOnInit(): void {
        // console.log('Observers', this.add.observers);
    }

    public onLeftIconClicked(): void {
        this.clickLeftIcon.emit();
    }

    public toggleClientConsole(): void {
        this.headbarService.nextClientConsoleState(!this.isClientConsoleOpen);
    }

    public toggleServerConsole(): void {
        this.headbarService.nextServerConsoleSate(!this.isServerConsoleOpen);
    }
}
