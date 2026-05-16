import { api } from '@/lib/fetcher';
import type { CreatePaymentIntentResponse, Payment } from '@/types/payment.types';

export const paymentService = {
  createIntent(missionUuid: string, amount: number) {
    return api.post<CreatePaymentIntentResponse>('/client/payment/create-intent', {
      mission_uuid: missionUuid,
      amount,
    });
  },
  confirmPayment(missionUuid: string, paymentIntentId: string) {
    return api.post<{ message: string; payment: Payment }>('/client/payment/confirm', {
      mission_uuid:       missionUuid,
      payment_intent_id:  paymentIntentId,
    });
  },
};
