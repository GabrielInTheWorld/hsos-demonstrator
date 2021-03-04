import { OnDestroy, Component } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
    template: ''
})
export class BaseComponent implements OnDestroy {
    protected subscriptions: Subscription[] = [];

    public ngOnDestroy(): void {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
        this.subscriptions = [];
    }
}
