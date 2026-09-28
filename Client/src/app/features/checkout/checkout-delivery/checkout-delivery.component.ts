import { Component, inject, OnInit, output } from '@angular/core';
import { CheckoutService } from '../../../core/services/checkout.service';
import { MatRadioModule } from '@angular/material/radio';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { DeliveryMethod } from '../../../shared/models/deliveryMethod';

@Component({
  selector: 'app-checkout-delivery',
  imports: [MatRadioModule, CurrencyPipe],
  templateUrl: './checkout-delivery.component.html',
  styleUrl: './checkout-delivery.component.css',
})
export class CheckoutDeliveryComponent implements OnInit {
  checkoutService = inject(CheckoutService);
  cartService = inject(CartService);
  deliveryComplete = output<boolean>();
  
  ngOnInit(): void {
    this.checkoutService.getDeliveryMethods().subscribe({
      next:(methods)=>{
        if(this.cartService.cart()?.deliveryMethodId){
          const method = methods.find(x=> x.id === this.cartService.cart()?.deliveryMethodId);
          if(method){
            this.cartService.selectedDelivery.set(method);
            this.deliveryComplete.emit(true);
          } 

        }
      }
    });
  }

  updateDeliveryMethod(method: DeliveryMethod){
    this.deliveryComplete.emit(false);
    this.cartService.selectedDelivery.set(method);
    const cart = this.cartService.cart();
    if(cart){
      const updatedCart = { ...cart, deliveryMethodId: method.id };
      this.cartService.setCart(updatedCart).subscribe({
        next: () => this.deliveryComplete.emit(true),
        error: (err) => {
          console.error('Failed to update cart delivery method', err);
        }
      });
    }
  }
}
