import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class HeadbarService {
    public get isServerConsoleOpen(): boolean {
        return this._serverConsoleStateSubject.value;
    }

    public get isClientConsoleOpen(): boolean {
        return this._clientConsoleStateSubject.value;
    }

    private readonly _serverConsoleStateSubject = new BehaviorSubject<boolean>(false);
    private readonly _clientConsoleStateSubject = new BehaviorSubject<boolean>(false);

    public constructor() {}

    public nextServerConsoleSate(isOpen: boolean): void {
        this._serverConsoleStateSubject.next(isOpen);
    }

    public nextClientConsoleState(isOpen: boolean): void {
        this._clientConsoleStateSubject.next(isOpen);
    }
}
