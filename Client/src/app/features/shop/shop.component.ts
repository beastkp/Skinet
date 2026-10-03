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
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatListOption, MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { ShopParams } from '../../shared/models/shopParams';
import { Pagination } from '../../shared/models/pagination';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [ProductItemComponent, MatButtonModule, MatIconModule, MatMenu, MatSelectionList, MatListOption, MatMenuTrigger, MatPaginator, FormsModule, EmptyStateComponent],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css'
})
export class ShopComponent implements OnInit {
  
  private shopService = inject(ShopService);
  private dialogService = inject(MatDialog);
  selectedBrands :string[] = [];
  selectedTypes :string[] = [];
  selectedSort: string = 'name';
  sortOptions = [
    {name: 'Alphabetical', value: 'name'},
    {name: 'Price: Low-High', value: 'priceAsc'},
    {name: 'Price: High-Low', value: 'priceDesc'}
  ]
  shopParams = new ShopParams();  
  
  products = signal<Pagination<Product> | null>(null);
  
  addToCart(product: Product): void {
    console.log('Added to cart:', product.name);
  }

  ngOnInit(): void {
    this.loadProducts();
    this.shopService.getBrands();
    this.shopService.getTypes();
  }

  resetFilters(){
    this.shopParams = new ShopParams();
    this.loadProducts();  
  }

  loadProducts() {
    this.shopService.getProducts(this.shopParams).subscribe({
      next: response => this.products.set(response),
      error: err => {
        console.log(err);
        this.products.set(null);
      }
    });
  }

  openFiltersDialog(){
    const dialogRef = this.dialogService.open(FiltersDialogComponent, {
      minWidth: '500px',
      data:{
        selectedBrands: this.shopParams.brands,
        selectedTypes: this.shopParams.types
      }
    });
    dialogRef.afterClosed().subscribe({
      next: response => {
        if(response){
          console.log(response);
          this.shopParams.brands = response.selectedBrands;
          this.shopParams.types = response.selectedTypes;  
          this.shopParams.pageNumber = 1;
          this.loadProducts();
        }
      }
    })
  }

  handlePageEvent(event: PageEvent){
    this.shopParams.pageNumber = event.pageIndex + 1;
    this.shopParams.pageSize = event.pageSize;
    this.loadProducts();
  }

  onSortChange(event: MatSelectionListChange){
    const selectedOption = event.options[0];
    if(selectedOption){
      this.shopParams.sort = selectedOption.value;
      this.shopParams.pageNumber = 1;
      this.loadProducts();
    }
  }

  onSearchChange(){
    this.shopParams.pageNumber = 1;
    this.loadProducts();
  }
}
