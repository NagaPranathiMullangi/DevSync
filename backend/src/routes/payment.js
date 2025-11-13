const express = require("express");
const { userAuth } = require("../middlewares/auth");
const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");
const Payment = require("../models/payment");
const User = require("../models/user");
const { membershipAmount } = require("../utils/constants");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const crypto = require("crypto");

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body;
    const { firstName, lastName, emailId } = req.user;

    console.log("------------------------");
    

    const order = await razorpayInstance.orders.create({
      amount: membershipAmount[membershipType] * 100,
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName,
        lastName,
        emailId,
        membershipType: membershipType,
      },
    });

    // Save it in my database
    //console.log(order);

    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    const savedPayment = await payment.save();

    // Return back my order details to frontend
    res.json({ ...savedPayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
});



paymentRouter.post("/payment/webhook", async (req, res) => {
  try {
    console.log("✅ Webhook called");

    const webhookSignature = req.get("X-Razorpay-Signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Convert raw body to string
    const rawBody = req.body.toString("utf8");

    console.log("🔹 Razorpay Signature:", webhookSignature);
    console.log("🔹 Using Secret:", secret);
    console.log("🔹 Raw Body Received:", rawBody);

    // ✅ Compute your own signature manually for verification
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    console.log("🔹 Computed Signature:", expectedSignature);

    // Validate with Razorpay’s helper (optional)
    const isValid = validateWebhookSignature(rawBody, webhookSignature, secret);
    console.log("🔹 validateWebhookSignature() returned:", isValid);

    if (!isValid) {
      console.log("❌ Invalid Webhook Signature (mismatch)");
      return res.status(400).json({
        msg: "Invalid webhook signature",
        received: webhookSignature,
        expected: expectedSignature,
      });
    }

    console.log("✅ Valid Webhook Signature");

    // Now safely parse and process
    const payload = JSON.parse(rawBody);
    const paymentDetails = payload.payload.payment.entity;

    const payment = await Payment.findOne({ orderId: paymentDetails.order_id });
    if (payment) {
      payment.status = paymentDetails.status;
      await payment.save();

      const user = await User.findById(payment.userId);
      if (user) {
        user.isPremium = true;
        user.membershipType = payment.notes.membershipType;
        await user.save();
      }

      console.log("🎉 Payment and user updated successfully!");
    }

    return res.status(200).json({ msg: "Webhook processed successfully" });
  } catch (err) {
    console.error("❌ Webhook Error:", err.message);
    return res.status(500).json({ msg: err.message });
  }
});




paymentRouter.get("/premium/verify", userAuth, async (req, res) => {
  const user = req.user.toJSON();
  console.log(user);
  if (user.isPremium) {
    return res.json({ ...user });
  }
  return res.json({ ...user });
});

module.exports = paymentRouter;
