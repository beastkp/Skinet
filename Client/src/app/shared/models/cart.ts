import {nanoid} from 'nanoid';

export type CartType ={
    id: String;
    items: CartItem[];
    deliveryMethodId?: number;
    paymentIntentId?: string;
    clientSecret?: string
}

export type CartItem = {
    productId: number;
    productName: string;
    price: number;
    pictureUrl: string;
    quantity: number;
    brand: string;
    type: string
}

export class Cart implements CartType {
  id = nanoid();
  items: CartItem[] = [];
  deliveryMethodId?: number;
  paymentIntentId?: string;
  clientSecret?: string;
}