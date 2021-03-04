import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class RouterService {
    public constructor(private router: Router) {}

    /**
     * Goes one location in the url back.
     *
     * For example: from `/app/user/detail` -> `/app/user`.
     */
    public goBack(): void {
        const urlSegments = this.router.url.split('/');
        this.router.navigate(urlSegments.slice(0, -1));
    }

    /**
     * Goes back to the home location `'/'`.
     */
    public goHome(): void {
        this.router.navigate(['']);
    }
}
