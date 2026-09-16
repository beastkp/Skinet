import { Component, inject, OnInit, signal } from '@angular/core';
import { ShopService } from '../../../core/services/shop.service';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../../../shared/models/product';
import { CurrencyPipe } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { MatDivider } from '@angular/material/divider';
import { CartService } from '../../../core/services/cart.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CurrencyPipe, MatButton, MatIconModule, MatFormField, MatInput, MatLabel, MatDivider, FormsModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent implements OnInit {
  private shopService = inject(ShopService);
  private activatedRoute = inject(ActivatedRoute);
  private cartService = inject(CartService);

  product = signal<Product | null>(null);
  quantityInCart =0;
  quantity = 1;

  ngOnInit(): void {
    this.loadProduct();
  }

  loadProduct(){
    const id = this.activatedRoute.snapshot.paramMap.get('id');

    if(!id) return;
    this.shopService.getProduct(+id).subscribe({
      next: response => {
        this.product.set(response);
        this.updateQuantityInCart();
      },
      error: err => console.log(err)
    })
  }

  updateCart(){
    const product = this.product();
    if(product){
      if(this.quantity > this.quantityInCart){
        const itemsToAdd = this.quantity - this.quantityInCart;
        this.quantityInCart += itemsToAdd;
        this.cartService.addItemToCart(product, itemsToAdd);
      }else{
        const itemsToRemove = this.quantityInCart - this.quantity;
        this.quantityInCart -= itemsToRemove;
        this.cartService.removeItemFromCart(product.id, itemsToRemove);
      }
    }
  }

  updateQuantityInCart(){
    this.quantityInCart = this.cartService.cart()?.items.find(x => x.productId === this.product()?.id)?.quantity || 0;
    this.quantity = this.quantityInCart || 1;
  }

  getButtonText(){
    return this.quantityInCart > 0 ? 'Update Cart' : 'Add to Cart';
  }
}
