import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    private readonly _oauthActivatedSubject = new BehaviorSubject<boolean>(false);

    public constructor() {}

    public getOAuthActivatedObservable(): Observable<boolean> {
        return this._oauthActivatedSubject.asObservable();
    }
}
