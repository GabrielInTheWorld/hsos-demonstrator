import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class HeadbarService {
    public get isConsoleOpen(): boolean {
        return this.consoleStateSubject.value;
    }

    private consoleStateSubject = new BehaviorSubject<boolean>(false);

    constructor() {}

    public nextSate(isOpen: boolean): void {
        this.consoleStateSubject.next(isOpen);
    }
}
