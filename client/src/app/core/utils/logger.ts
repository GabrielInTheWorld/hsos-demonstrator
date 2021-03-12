import { BehaviorSubject, Observable } from 'rxjs';

export class Logger {
    private static readonly _logMessageSubject = new BehaviorSubject<any[]>([]);

    public static next(...messages: any[]): void {
        this._logMessageSubject.next(messages);
    }

    public static getLogMessagesObservable(): Observable<any[]> {
        return this._logMessageSubject.asObservable();
    }
}
