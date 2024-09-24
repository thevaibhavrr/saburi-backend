const Razorpay = require("razorpay");

const keyId = "rzp_test_DaA1MMEW2IUUYe";
const keySecret = "q67o8eUlhpkUQAMSQTTgki8y";

// Create Razorpay Order
exports.createRazorpayOrder = async (req, res) => {
  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  const options = {
    amount: req.body.amount * 100, // amount in paise
    currency: "INR",
    receipt: "receipt#1",
    payment_capture: 1,
  };

  try {
    const response = await razorpay.orders.create(options);
    res.json({
      order_id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to create Razorpay order" });
  }
};

// Get Payment Details by Payment ID
exports.getPaymentDetailsById = async (req, res) => {
  const { paymentId } = req.params;
  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  try {
    const response = await razorpay.payments.fetch(paymentId);
    res.json({
      status: response.status,
      method: response.method,
      amount: response.amount,
      currency: response.currency,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch payment details" });
  }
};
