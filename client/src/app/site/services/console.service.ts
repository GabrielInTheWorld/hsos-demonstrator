import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface MessageObject {
    message: string;
    color: string;
}

@Injectable({
    providedIn: 'root'
})
export class ConsoleService {
    private readonly consoleSubject = new BehaviorSubject<string[]>([]);

    private readonly messages: any[] = [];
    private readonly oldLog: (...messages: any[]) => void;

    public constructor() {
        // this.oldLog = console.log;
        // console.log = (...messages: any[]) => this.log(...messages);
        // // tslint:disable-next-line:no-console
        // console.debug = (...messages: any[]) => this.debug(...messages);
        // console.error = (...messages: any[]) => this.error(...messages);
    }

    public log(...messages: any[]): void {
        this.pushMessages(...messages);
    }

    public debug(...messages: any[]): void {
        this.pushMessages(...messages);
    }

    public error(...messages: any[]): void {
        this.pushMessages(...messages);
    }

    public getMessageObservable(): Observable<string[]> {
        return this.consoleSubject.asObservable();
    }

    private getTimeString(): string {
        const date = new Date();
        return (
            `[${this.formatDateTimeString(date.getHours())}:` + //
            `${this.formatDateTimeString(date.getMinutes())}:` + //
            `${this.formatDateTimeString(date.getSeconds())}]`
        );
    }

    private formatDateTimeString(toFormat: string | number): string {
        return `0${toFormat}`.slice(-2);
    }

    private pushMessages(...messages: any): void {
        this.printToConsole(...messages);
        let nextMessage = `${this.getTimeString()}\n`;
        for (const message of messages) {
            if (!message) {
                nextMessage += `Empty\n`;
                continue;
            }
            if (Array.isArray(message)) {
                nextMessage += this.convertArrayToString(message);
            } else if (typeof message === 'object') {
                nextMessage += this.convertObjectToString(message);
            } else {
                nextMessage += `${message}\n`;
            }
        }
        this.messages.push(nextMessage);
        this.consoleSubject.next(this.messages);
    }

    private convertArrayToString<T>(array: T[]): string {
        let result = '[ ';
        for (const item of array) {
            if (typeof item === 'object') {
                result += this.convertObjectToString(item);
            } else {
                result += item;
            }
        }
        result += ' ]';
        return result;
    }

    private convertObjectToString<T>(obj: T): string {
        if (!obj) {
            return;
        }
        // let result = '{ ';
        // if (obj instanceof Map) {
        //     obj.forEach((value, key) => {
        //         result += this.getObjectMessageString(key, value);
        //         result += '\n';
        //     });
        // } else {
        //     for (const key of Object.keys(obj)) {
        //         result += this.getObjectMessageString(key, obj[key]);
        //         result += '\n';
        //     }
        // }
        // result += ' }\n';
        try {
            const result = JSON.stringify(obj);
            return result + '\n';
        } catch (e) {
            // this.printToConsole(e);
            return '\n\r';
        }
    }

    private getObjectMessageString(key: string, value: any): string {
        return ` ${key}: ${typeof value === 'object' ? this.convertObjectToString(value) : value} `;
    }

    public printToConsole(...messages: any[]): void {
        this.oldLog(...messages);
    }
}
