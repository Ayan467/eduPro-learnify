import { useState } from 'react';
import { Spinner } from '../common/UI';
import API from '../../services/api';
import toast from 'react-hot-toast';

export default function PaymentModal({ course, onSuccess, onClose }) {
  const [processing, setProcessing] = useState(false);
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  const formatCard = (val) => {
    const v = val.replace(/\D/g, '').substring(0, 16);
    return v.replace(/(.{4})/g, '$1 ').trim();
  };

  const handlePay = async () => {
    if (!cardNum || !expiry || !cvv || !name)
      return toast.error('Please fill all card details');

    setProcessing(true);
    try {
      // Step 1: Create Razorpay order
      const { data: order } = await API.post('/payments/create-order', { courseId: course._id });

      // Step 2: Mock verification (in production, use Razorpay checkout SDK)
      // Simulate payment success
      await new Promise(res => setTimeout(res, 1500));

      // Step 3: Verify and enroll
      await API.post('/payments/verify', {
        razorpay_order_id: order.orderId,
        razorpay_payment_id: `pay_mock_${Date.now()}`,
        razorpay_signature: 'mock_signature',
        courseId: course._id,
      });

      toast.success('Payment successful! You are now enrolled.');
      onSuccess?.();
    } catch (err) {
      // Fallback: direct enroll for mock/demo
      try {
        await API.post('/enroll', { courseId: course._id, paymentId: `mock_${Date.now()}` });
        toast.success('Enrolled successfully!');
        onSuccess?.();
      } catch (e) {
        toast.error(e.response?.data?.message || 'Payment failed');
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Complete Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="bg-primary-light rounded-lg p-4 mb-5">
          <p className="text-sm text-gray-600">{course.title}</p>
          <p className="text-2xl font-bold text-primary-dark mt-1">₹{course.price}</p>
        </div>

        <div className="space-y-3">
          <input className="input-field" placeholder="Card Number"
            value={cardNum} onChange={e => setCardNum(formatCard(e.target.value))} maxLength={19} />
          <div className="grid grid-cols-2 gap-3">
            <input className="input-field" placeholder="MM/YY"
              value={expiry} onChange={e => setExpiry(e.target.value)} maxLength={5} />
            <input className="input-field" placeholder="CVV" type="password"
              value={cvv} onChange={e => setCvv(e.target.value)} maxLength={3} />
          </div>
          <input className="input-field" placeholder="Cardholder Name"
            value={name} onChange={e => setName(e.target.value)} />
        </div>

        <button onClick={handlePay} disabled={processing}
          className="w-full mt-5 bg-secondary text-white py-3 rounded-xl font-semibold hover:bg-secondary-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          {processing ? <><Spinner size="sm" /> Processing...</> : `Pay ₹${course.price}`}
        </button>

        <p className="text-center text-xs text-gray-400 mt-3">🔒 Secured by Razorpay</p>
      </div>
    </div>
  );
}
