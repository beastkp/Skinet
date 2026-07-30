import { Component, inject } from '@angular/core';
import { ShopService } from '../../../core/services/shop.service';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'app-filters-dialog',
  standalone: true,
  imports: [MatDivider],
  templateUrl: './filters-dialog.component.html',
  styleUrl: './filters-dialog.component.css'
})
export class FiltersDialogComponent {
  shopService= inject(ShopService

  )
}
