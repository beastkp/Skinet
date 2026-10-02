import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { OrderSummaryComponent } from '../../shared/components/order-summary/order-summary.component';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { Router, RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { StripeService } from '../../core/services/stripe.service';
import { ConfirmationToken, StripeAddressElement, StripeAddressElementChangeEvent, StripePaymentElement, StripePaymentElementChangeEvent } from '@stripe/stripe-js';
import { SnackBarService } from '../../core/services/snackbar.service';
import { MatCheckboxModule, MatCheckboxChange } from '@angular/material/checkbox';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Address } from '../../shared/models/user';
import { AccountService } from '../../core/services/account.service';
import { BehaviorSubject, filter, firstValueFrom, Subject } from 'rxjs';
import { CheckoutDeliveryComponent } from './checkout-delivery/checkout-delivery.component';
import { CartService } from '../../core/services/cart.service';
import { CurrencyPipe, JsonPipe } from '@angular/common';
import { CheckoutReviewComponent } from './checkout-review/checkout-review.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrderToCreate, ShippingAddress } from '../../shared/models/order';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-checkout',
  imports: [
    OrderSummaryComponent,
    MatStepperModule,
    RouterLink,
    MatButton,
    MatCheckboxModule,
    CheckoutDeliveryComponent,
    CheckoutReviewComponent,
    CurrencyPipe,
    MatProgressSpinnerModule,
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private stripeService = inject(StripeService);
  private snackbar = inject(SnackBarService);
  private accountService = inject(AccountService);
  private router = inject(Router);
  cartService = inject(CartService);
  private orderService = inject(OrderService);
  addressElement?: StripeAddressElement;
  paymentElement?: StripePaymentElement;
  saveAddress = false;
  completionStatus = signal<{ address: boolean; card: boolean; delivery: boolean }>({
    address: false,
    card: false,
    delivery: false,
  });
  private deliveryReady$ = new BehaviorSubject<boolean>(false);

  loadingMessages = [
    'Securing your payment details...',
    'Talking to our payment provider...',
    'Almost there, finalizing your order summary...',
  ];
  loadingMessageIndex = signal(0);
  private messageIntervalId?: ReturnType<typeof setInterval>;

  confirmationToken = signal<any | null>(null);
  loading = false;

  async ngOnInit() {
    try {
      this.addressElement = await this.stripeService.getAddressElement();

      this.addressElement.on('change', this.handleAddressChange);
      this.addressElement.on('ready', async () => {
        const result = await this.addressElement?.getValue();
        if (result?.value.address)
          this.completionStatus.update((state) => ({ ...state, address: true }));
      });
      this.addressElement.mount('#address-element');

      this.paymentElement = await this.stripeService.getPaymentElement();
      this.paymentElement.on('change', this.handlePaymentChange);
      this.paymentElement.mount('#payment-element');
    } catch (error: any) {
      this.snackbar.error(error.message);
    }
  }

  handleAddressChange = (event: StripeAddressElementChangeEvent) => {
    this.completionStatus.update((state) => ({ ...state, address: event.complete }));
  };

  handlePaymentChange = (event: StripePaymentElementChangeEvent) => {
    this.completionStatus.update((state) => ({ ...state, card: event.complete }));
  };

  handleDeliveryChange(event: boolean) {
     this.completionStatus.update((state) => ({ ...state, delivery: event }));
     this.deliveryReady$.next(event);
  }

  async waitForDeliveryReady(): Promise<void> {
    await firstValueFrom(this.deliveryReady$.pipe(filter((v) => v === true)));
  }

  async getConfirmationToken() {
    this.startLoadingMessages();
    try {
      if (Object.values(this.completionStatus()).every((status) => status === true)) {
        const result = await this.stripeService.createConfirmationToken();
        if (result.error) throw new Error(result.error.message);
        this.confirmationToken.set(result.confirmationToken);
      }
    } catch (error: any) {
      this.snackbar.error(error.message);
    } finally {
      this.stopLoadingMessages();
    }
  }

  private startLoadingMessages() {
    this.stopLoadingMessages();

    this.loadingMessageIndex.set(0);

    this.messageIntervalId = setInterval(() => {
      this.loadingMessageIndex.update((i) => (i + 1) % this.loadingMessages.length);
    }, 1500);
  }

  private stopLoadingMessages() {
    if (this.messageIntervalId) {
      clearInterval(this.messageIntervalId);
      this.messageIntervalId = undefined;
    }
  }

  async onStepChange(event: StepperSelectionEvent) {
    if (event.selectedIndex === 1) {
      if (this.saveAddress) {
        const address = (await this.getAddressFromStripeAddress()) as Address;
        address && firstValueFrom(this.accountService.updateAddress(address));
      }
    }
    if (event.selectedIndex === 2) {
      await this.waitForDeliveryReady();
      await firstValueFrom(this.stripeService.createOrUpdatePaymentIntent());
    }
    if (event.selectedIndex === 3) {
      await this.getConfirmationToken();
    }
  }

  async confirmPayment(stepper: MatStepper) {
    this.loading = true;
    try {
      if (this.confirmationToken) {
        const order = await this.createOrderModel();
        const orderResult = await firstValueFrom(this.orderService.createOrder(order));
        const result = await this.stripeService.confirmPayment(this.confirmationToken());

        if (result.paymentIntent?.status === 'succeeded') {
          if (orderResult) {
            this.cartService.deleteCart();
            this.orderService.orderComplete = true;
            this.cartService.selectedDelivery.set(null);
            this.router.navigateByUrl('/checkout/success');
          } else {
            throw new Error('Order creation failed');
          }
        } else if (result.error) {
          throw new Error(result.error.message);
        } else {
          throw new Error('Something went wrong');
        }
      }
    } catch (error: any) {
      this.snackbar.error(error.message || 'Something wentt wrong');
      stepper.previous();
    } finally {
      this.loading = false;
    }
  }

  private async createOrderModel(): Promise<OrderToCreate> {
    const cart = this.cartService.cart();
    const shippingAddress = (await this.getAddressFromStripeAddress()) as ShippingAddress;

    const card = this.confirmationToken()?.payment_method_preview.card;
    if (!cart?.id || !cart.deliveryMethodId || !card || !shippingAddress)
      throw new Error('Problem creating order');

    return {
      cartId: cart.id,
      paymentSummary: {
        last4: +card.last4,
        brand: card.brand,
        expMonth: card.exp_month,
        expYear: card.exp_year,
      },
      deliveryMethodId: cart.deliveryMethodId,
      shippingAddress,
      discount: this.cartService.totals()?.discount,
    };
  }

  async getAddressFromStripeAddress(): Promise<Address | ShippingAddress | null> {
    const result = await this.addressElement?.getValue();
    const address = result?.value.address;

    if (address) {
      return {
        name: result.value.name,
        line1: address.line1,
        line2: address.line2 || undefined,
        city: address.city,
        country: address.country,
        state: address.state,
        postalCode: address.postal_code,
      };
    } else return null;
  }

  onSaveAddressCheckBoxChange(event: MatCheckboxChange) {
    this.saveAddress = event.checked;
  }

  ngOnDestroy(): void {
    this.stripeService.disposeElements();
  }
}
