import { Pipe, PipeTransform } from '@angular/core';
import { ConfirmationToken } from '@stripe/stripe-js';
import { PaymentSummary } from '../models/order';

@Pipe({
  name: 'payment',
})
export class PaymentPipe implements PipeTransform {
  transform(value?: ConfirmationToken['payment_method_preview'] | PaymentSummary, ...args: unknown[]): unknown {
    if (value && 'card' in value) {
      const { brand, country, exp_month, exp_year, last4 } = (value as ConfirmationToken['payment_method_preview']).card!;
      return `${brand} , **** **** **** ${last4}, Expiration: ${exp_month}/${exp_year}, ${country}`;
    }else if(value && 'last4' in value){
      const { brand, expMonth, expYear, last4 } = value as PaymentSummary
      return `${brand} , **** **** **** ${last4}, Expiration: ${expMonth}/${expYear}`;
    } 
    
    else {
      return 'Unknown card';
    }
  }
}
