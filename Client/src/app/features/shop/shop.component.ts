import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "../../layout/header/header.component";
import { toSignal } from '@angular/core/rxjs-interop';
import { map, catchError, of } from 'rxjs';
import { Product } from '../../shared/models/product';
import { ShopService } from '../../core/services/shop.service'
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { CurrencyPipe } from '@angular/common';
import { ProductItemComponent } from "./product-item/product-item.component";
import { MatDialog } from '@angular/material/dialog';
import { FiltersDialogComponent } from './filters-dialog/filters-dialog.component';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [ ProductItemComponent, MatButtonModule, MatIconModule],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css'
})
export class ShopComponent implements OnInit {
  
  private shopService = inject(ShopService);
  private dialogService = inject(MatDialog);
  selectedBrands :string[] = [];
  selectedTypes :string[] = [];
  
  products = toSignal(
    this.shopService.getProducts().pipe(
      map(response => {
        console.log(response);
        return response.data;
      }),
      catchError(error => {
        console.log(error);
        return of([] as Product[]);
      })
    ),
    { initialValue: [] as Product[] }
  );
  
  addToCart(product: Product): void {
    console.log('Added to cart:', product.name);
  }

  ngOnInit(): void {
    this.shopService.getBrands();
    this.shopService.getTypes();
  }

  openFiltersDialog(){
    const dialogRef = this.dialogService.open(FiltersDialogComponent, {
      minWidth: '500px',
      data:{
        selectedBrands: this.selectedBrands,
        selectedTypes: this.selectedTypes
      }
    });
    dialogRef.afterClosed().subscribe({
      next: response => {
        if(response){
          console.log(response);
          this.selectedBrands = response.selectedBrands;
          this.selectedTypes = response.selectedTypes;  
        }
      }
    })
  }
}
