import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/v1';
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

export interface CreateOrderResponse {
  success: boolean;
  data: {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
  };
}

export const createOrder = async (amount: number, currency: string = 'INR', receipt?: string, notes?: any) => {
  const res = await axios.post<CreateOrderResponse>(`${API_BASE}/payments/create-order`, {
    amount,
    currency,
    receipt,
    notes,
  });
  return res.data;
};

export const verifyPayment = async (payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => {
  const res = await axios.post(`${API_BASE}/payments/verify`, payload);
  return res.data as { success: boolean; message: string };
};

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-checkout-js')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const openCheckout = async (options: {
  amount: number; // in rupees
  currency?: string;
  name?: string;
  description?: string;
  receipt?: string;
  notes?: any;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}) => {
  const ok = await loadRazorpayScript();
  if (!ok) throw new Error('Failed to load Razorpay');

  const orderResp = await createOrder(options.amount, options.currency || 'INR', options.receipt, options.notes);
  if (!orderResp.success) throw new Error('Order creation failed');

  const order = orderResp.data;

  const rzOptions: any = {
    key: RAZORPAY_KEY_ID,
    amount: order.amount, // paise
    currency: order.currency,
    name: options.name || 'Bhopa Business',
    description: options.description || 'Payment',
    order_id: order.id,
    notes: options.notes || {},
    prefill: options.prefill || {},
    handler: async (response: any) => {
      await verifyPayment({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });
    },
    theme: { color: '#2563eb' },
  };

  // @ts-ignore
  const rzp = new window.Razorpay(rzOptions);
  rzp.open();
};


