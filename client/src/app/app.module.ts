import { HttpClientModule, HttpClientXsrfModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptorService } from './core/services/auth-interceptor.service';
import { AuthTokenService } from './core/services/auth-token.service';
import { UIModule } from './ui/ui.module';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        HttpClientModule,
        HttpClientXsrfModule.withOptions({
            cookieName: 'refreshId',
            headerName: 'X-CSRFToken'
        }),
        AppRoutingModule,
        BrowserAnimationsModule,
        UIModule
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, deps: [AuthTokenService], multi: true }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
