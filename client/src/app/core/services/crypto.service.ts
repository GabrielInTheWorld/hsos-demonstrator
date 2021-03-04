import { Injectable } from '@angular/core';
import { sha256 } from 'sha.js';

@Injectable({
    providedIn: 'root'
})
export class CryptoService {
    /**
     * PKCE-Helper function.
     * See `https://github.com/aaronpk/pkce-vanilla-js/blob/master/index.html`
     * Generates a random string.
     */
    public generateRandomString(length: number = 56): string {
        const array = new Uint32Array(length / 2);
        window.crypto.getRandomValues(array);
        return Array.from(array, dec => `0${dec.toString(16)}`.substr(-2)).join('');
    }

    public sha(plain: string): string {
        return new sha256().update(plain).digest('hex');
    }
}
