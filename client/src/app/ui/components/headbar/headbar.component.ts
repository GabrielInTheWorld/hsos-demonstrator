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

    public get isConsoleOpen(): boolean {
        return this.headbarService.isConsoleOpen;
    }

    public constructor(private headbarService: HeadbarService) {}

    public ngOnInit(): void {
        // console.log('Observers', this.add.observers);
    }

    public onLeftIconClicked(): void {
        this.clickLeftIcon.emit();
    }

    public toggleConsole(): void {
        this.headbarService.nextSate(!this.headbarService.isConsoleOpen);
    }
}
