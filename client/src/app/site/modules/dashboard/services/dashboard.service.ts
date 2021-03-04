import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface DashboardItem {
    title: string;
    onClick?: () => void;
    routerLinkSegments?: string[];
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private readonly dashboardItemSubject = new BehaviorSubject<DashboardItem[]>([]);

    public constructor() {}

    public registerDashboardItem(item: DashboardItem): void {
        const items = this.dashboardItemSubject.value;
        items.push(item);
        this.dashboardItemSubject.next(items);
    }

    public getDashboardItemObservable(): Observable<DashboardItem[]> {
        return this.dashboardItemSubject.asObservable();
    }
}
