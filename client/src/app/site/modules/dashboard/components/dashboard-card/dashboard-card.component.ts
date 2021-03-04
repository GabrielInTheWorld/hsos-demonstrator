import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardItem } from '../../services/dashboard.service';

@Component({
    selector: 'app-dashboard-card',
    templateUrl: './dashboard-card.component.html',
    styleUrls: ['./dashboard-card.component.scss']
})
export class DashboardCardComponent implements OnInit {
    @Input()
    public dashboardItem: DashboardItem;

    public get title(): string {
        return this.dashboardItem ? this.dashboardItem.title : '';
    }

    public constructor(private readonly router: Router) {}

    public ngOnInit(): void {}

    public onClick(): void {
        if (this.dashboardItem && this.dashboardItem.onClick) {
            this.dashboardItem.onClick();
        }
        if (this.dashboardItem && this.dashboardItem.routerLinkSegments) {
            this.router.navigate(this.dashboardItem.routerLinkSegments);
        }
    }
}
