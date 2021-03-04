import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface EventMessage {
    event: string;
    data: any;
}

export class EventMap {
    private readonly map: Map<string, BehaviorSubject<any>> = new Map();

    public pushMessage<T>(eventName: string, data: T): Observable<T> {
        const observable = this.getSubject<T>(eventName);
        observable.next(data);
        return this.createObservable(observable);
    }

    public fromEvent<T>(eventName: string): Observable<T> {
        return this.createObservable(this.getSubject<T>(eventName));
    }

    private getSubject<T>(eventName: string): BehaviorSubject<T> {
        let observable = this.map.get(eventName);
        if (!observable) {
            observable = new BehaviorSubject(null);
            this.map.set(eventName, observable);
        }
        return observable;
    }

    private createObservable<T>(observable: Observable<T>): Observable<T> {
        return observable.pipe(filter(value => !!value));
    }
}
