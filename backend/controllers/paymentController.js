const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payments/create-order
const createOrder = async (req, res) => {
  const { courseId } = req.body;
  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const options = {
      amount: course.price * 100, // paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Save pending payment
    await Payment.create({
      student: req.user._id,
      course: courseId,
      amount: course.price,
      razorpayOrderId: order.id,
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/payments/verify
const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;
  try {
    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSig !== razorpay_signature)
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });

    // Update payment status
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, status: 'success', paidAt: new Date() }
    );

    // Auto enroll student
    const exists = await Enrollment.findOne({ student: req.user._id, course: courseId });
    if (!exists) {
      await Enrollment.create({ student: req.user._id, course: courseId, paymentId: razorpay_payment_id });
      await Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: 1 } });
      await User.findByIdAndUpdate(req.user._id, { $push: { enrolledCourses: courseId } });
    }

    res.json({ success: true, message: 'Payment verified and enrolled successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/payments/my-payments
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ student: req.user._id, status: 'success' })
      .populate('course', 'title thumbnail');
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createOrder, verifyPayment, getMyPayments };
