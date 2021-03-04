import { Component, Input, OnInit } from '@angular/core';

export type Orientation = 'vertical' | 'horizontal';

@Component({
    selector: 'app-grid',
    templateUrl: './grid.component.html',
    styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit {
    @Input()
    public fullHeight = false;

    @Input()
    public centering = false;

    @Input()
    public orientation: Orientation = 'horizontal';

    public constructor() {}

    public ngOnInit(): void {}
}
