import { OfflineService } from './offline.service';
import { EventMap, EventMessage } from './../utils/event-map';
import { Injectable, NgZone } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Logger } from '../utils/logger';

interface IdentificationObject {
    id: string;
}

@Injectable({
    providedIn: 'root'
})
export class SocketService {
    private readonly websocketUri: string;

    private identification: string;

    private websocket: WebSocket = null;

    private readonly mapEvents = new EventMap();

    private reconnectTries = 0;

    private readonly reset = new Subject<void>();

    private readonly websocketConnectionSubject = new Subject<boolean>();

    public get id(): string {
        return this.identification;
    }

    public get user(): IdentificationObject {
        return { id: this.id };
    }

    public get isConnected(): boolean {
        return this.websocket && this.websocket.readyState === 1;
    }

    public get onReset(): Observable<void> {
        return this.reset.asObservable();
    }

    public get onWebsocketConnection(): Observable<boolean> {
        return this.websocketConnectionSubject.asObservable();
    }

    public constructor(private readonly zone: NgZone, private readonly offlineService: OfflineService) {
        const protocol = window.location.protocol;
        const location = window.location.hostname;
        const port = window.location.port;
        this.websocketUri = `${protocol === 'https:' ? 'wss' : 'ws'}://${location}:${port === '4200' ? '8000' : port}`;
        this.connectToWebsocket(this.websocketUri);
    }

    public emit<T, R>(eventName: string, data?: T, to?: string): Observable<R> {
        const observable = this.fromEvent<R>(eventName);
        const message = data;
        this.send(eventName, message, to);
        return observable;
    }

    private send(type: string, message: any, to: string = null): void {
        if (!this.isConnected && this.websocket) {
            this.websocket.close();
        }
        if (!this.isConnected) {
            return;
        }
        const date = { type, message, to };
        console.log('Send message to server:', date);
        this.websocket.send(JSON.stringify(date));
    }

    public fromEvent<T>(eventName: string): Observable<T> {
        return this.mapEvents.fromEvent(eventName);
    }

    private parseMessage(event: any): void {
        try {
            const message: EventMessage = JSON.parse(event.data) as EventMessage;
            this.mapEvents.pushMessage(message.event, message.data);
        } catch {
            Logger.next('Nachricht enthält kein gültiges JSON-Format:', event.data);
        }
    }

    private connectToWebsocket(wsUri: string): void {
        Logger.next('Verbinde unter:', wsUri);
        this.websocket = new WebSocket(wsUri, 'echo-protocol');

        this.websocket.onopen = event => {
            Logger.next('Verbunden!');
            this.reconnectTries = 0;
            this.offlineService.nextOfflineState(false);
            this.websocketConnectionSubject.next(true);
        };

        this.websocket.onclose = () => {
            this.websocketConnectionSubject.next(false);
            this.zone.run(() => this.onClose());
        };

        this.websocket.onerror = event => {
            Logger.next('Ein Fehler bei der TCP-Verbindung ist aufgetreten...', 'Verbinde neu...');
            this.websocket.close();
        };

        this.websocket.onmessage = event => {
            this.parseMessage(event);
        };
    }

    private onClose(): void {
        try {
            if (this.websocket) {
                this.reset.next();
                this.websocket.close();
                this.websocket = null;
            }
            setTimeout(() => this.connectToWebsocket(this.websocketUri), 2000);
            if (this.reconnectTries < 3) {
                this.reconnectTries += 1;
            } else {
                Logger.next('Wir sind offline.');
                this.offlineService.nextOfflineState(true);
            }
        } catch (error) {
            Logger.next('Ein Fehler ist aufgetreten:', error.message);
        }
    }
}
