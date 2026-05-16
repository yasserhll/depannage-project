export type PaymentStatus =
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'released'
  | 'refunded'
  | 'partially_refunded'
  | 'failed'
  | 'disputed';

export interface Payment {
  id:                       number;
  mission_id:               number;
  stripe_payment_intent_id: string;
  amount:                   number;
  currency:                 string;
  status:                   PaymentStatus;
  authorized_at:            string | null;
  released_at:              string | null;
  refunded_at:              string | null;
  created_at:               string;
}

export interface CreatePaymentIntentResponse {
  client_secret: string;
  payment_id:    number;
}
