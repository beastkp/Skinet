import { inject, Injectable } from '@angular/core';
import { CartService } from './cart.service';
import { forkJoin, of, tap } from 'rxjs';
import { AccountService } from './account.service';
import { SignalrService } from './signalr.service';

@Injectable({
  providedIn: 'root',
})
export class InitService {
  private cartService = inject(CartService);
  private accountService = inject(AccountService);
  private signalrService = inject(SignalrService);

  init() {
    const cartId = localStorage.getItem('cartId');
    const cart$ = cartId ? this.cartService.getCart(cartId) : of(null);
    return forkJoin({
        cart: cart$,
        user: this.accountService.getUserInfo().pipe(
          tap(user => {
            if(user) this.signalrService.createHubConnection();
          })
        )
    })
  }
  //app-initializer needs to wait for us to go and fetch the cart from the database. So it works well with observables but not with signals.So we need to return an observable from this function to make our app initializer wait to initialize the app otherwise it will think everything is fine.
}
