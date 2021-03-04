import { SocketService } from './core/services/socket.service';
import { Component } from '@angular/core';

import { ConsoleService } from './site/services/console.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    public title = 'client';

    public constructor(_consoleService: ConsoleService, _socket: SocketService) {}
}
