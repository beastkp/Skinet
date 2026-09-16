import { inject, Injectable } from '@angular/core';
import { CartService } from './cart.service';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InitService {
  private cartService = inject(CartService);

  init() {
    const cartId = localStorage.getItem('cartId');
    const cart$ = cartId ? this.cartService.getCart(cartId) : of(null);
    return cart$;
  }
  //app-initializer needs to wait for us to go and fetch the cart from the database. So it works well with observables but not with signals.So we need to return an observable from this function to make our app initializer wait to initialize the app otherwise it will think everything is fine.
}
