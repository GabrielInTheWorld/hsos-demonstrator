import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { SocketService } from 'src/app/core/services/socket.service';

@Injectable({
    providedIn: 'root'
})
export class ConsoleService {
    private readonly _logServerMessagesSubject = new BehaviorSubject<any[]>([]);

    public constructor(private readonly socket: SocketService) {
        socket.fromEvent<any[]>('server-message').subscribe(messages => this._logServerMessagesSubject.next(messages));
    }

    public getLogServerMessagesObservable(): Observable<any[]> {
        return this._logServerMessagesSubject.asObservable();
    }
}
