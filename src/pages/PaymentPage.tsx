import React, { useState } from 'react';
import Button from '../components/ui/Button';
import { openCheckout } from '../services/paymentService';

const PaymentPage: React.FC = () => {
  const [amount, setAmount] = useState<number>(199);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setError(null);
    setLoading(true);
    try {
      await openCheckout({
        amount,
        currency: 'INR',
        name: 'Bhopa Business',
        description: 'Pro plan',
        notes: { plan: 'pro' },
      });
    } catch (e: any) {
      setError(e?.message || 'Payment failed to start');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-xl shadow">
      <h1 className="text-xl font-semibold mb-4">Make a Payment</h1>
      <label className="block text-sm text-gray-700 mb-2">Amount (INR)</label>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="w-full border rounded px-3 py-2 mb-4"
        min={1}
      />
      <Button onClick={handlePay} disabled={loading} className="w-full">
        {loading ? 'Processing...' : 'Pay with Razorpay'}
      </Button>
      {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
    </div>
  );
};

export default PaymentPage;


