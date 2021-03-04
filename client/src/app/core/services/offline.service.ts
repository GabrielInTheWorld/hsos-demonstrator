import { Observable, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class OfflineService {
    constructor() {}
    public get offlineStateAsObservable(): Observable<boolean> {
        return this.isOffline.asObservable();
    }

    private isOffline = new BehaviorSubject<boolean>(true);

    public nextOfflineState(isOffline: boolean): void {
        this.isOffline.next(isOffline);
    }
}
