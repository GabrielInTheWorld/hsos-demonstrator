import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { SocketService } from 'src/app/core/services/socket.service';
import { User } from './../models/user';
import { Logger } from 'src/app/core/utils/logger';

// tslint:disable-next-line: variable-name
export const AuthenticationTypeVerboseName = {
    password: 'Passwort',
    totp: 'Totp',
    hotp: 'Hotp',
    email: 'E-Mail',
    fido: 'FIDO2'
};

const webAuthnConfig = {
    timout: 30000
};

@Injectable({
    providedIn: 'root'
})
export class UsersService {
    private readonly userSubject = new BehaviorSubject<User[]>([]);
    private readonly authenticationTypeSubject = new BehaviorSubject<string[]>([]);

    private currentUserToCreate: Partial<User>;

    public constructor(private readonly websocket: SocketService) {
        this.initWebsocketEvents();
    }

    public getAllUsersInstantly(): User[] {
        return this.userSubject.value;
    }

    public getAllUsersObservable(): Observable<User[]> {
        return this.userSubject.asObservable();
    }

    public getAuthenticationTypesInstantly(): string[] {
        return this.authenticationTypeSubject.value;
    }

    public async create(user: Partial<User>): Promise<void> {
        if (!user) {
            return;
        }
        Logger.next('Erstelle Benutzer: ', user);
        this.currentUserToCreate = user;
        this.websocket.emit('create-user', user);
    }

    public async update(userId: string, user: Partial<User>): Promise<void> {
        if (!user) {
            return;
        }
        this.websocket.emit('update-user', { ...user, userId });
    }

    public async delete(user: User): Promise<void> {
        if (!user) {
            return;
        }
        this.websocket.emit('delete-user', user.userId);
    }

    public async getUser(userId: string): Promise<User> {
        return new Promise(resolve => {
            this.websocket.emit<string, User>('get-user', userId).subscribe(_user => {
                if (!_user) {
                    return;
                }
                resolve(_user);
            });
        });
    }

    public async resetDatabase(): Promise<void> {
        return new Promise(resolve => {
            this.websocket.emit('reset-database').subscribe(() => resolve());
        });
    }

    public async updateCurrentUserToCreate(update: Partial<User>): Promise<void> {
        this.currentUserToCreate = { ...this.currentUserToCreate, ...update };
        await this.create(this.currentUserToCreate);
    }

    private initWebsocketEvents(): void {
        this.websocket.emit('all-users').subscribe(allUsers => {
            if (allUsers && Array.isArray(allUsers)) {
                this.userSubject.next(allUsers);
            }
        });
        this.websocket.emit('all-authentication-types').subscribe(types => {
            if (types && Array.isArray(types)) {
                this.authenticationTypeSubject.next(types);
            }
        });
    }
}
