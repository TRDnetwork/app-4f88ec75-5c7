```javascript
// Enhanced webhook handler with better error handling and logging
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const pool = req.app.get('pool');
  
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('💰 Checkout session completed:', session.id);
        
        // Update user to Pro tier
        await pool.query(
          'UPDATE app_4994_users SET subscription_tier = $1, stripe_customer_id = $2 WHERE id = $3',
          ['pro', session.customer, session.client_reference_id]
        );
        
        // Log subscription creation
        console.log(`✅ User ${session.client_reference_id} upgraded to Pro`);
        break;

      case 'customer.subscription.updated':
        const subscription = event.data.object;
        console.log('📅 Subscription updated:', subscription.id);
        
        // Handle subscription changes (e.g., plan changes)
        if (subscription.status === 'active') {
          await pool.query(
            'UPDATE app_4994_users SET subscription_tier = $1 WHERE stripe_customer_id = $2',
            ['pro', subscription.customer]
          );
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        console.log('❌ Subscription deleted:', deletedSubscription.id);
        
        // Downgrade user to Free tier
        await pool.query(
          'UPDATE app_4994_users SET subscription_tier = $1 WHERE stripe_customer_id = $2',
          ['free', deletedSubscription.customer]
        );
        break;

      case 'invoice.paid':
        const invoice = event.data.object;
        console.log('✅ Invoice paid:', invoice.id);
        // You could send a receipt email here
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        console.log('❌ Invoice payment failed:', failedInvoice.id);
        
        // Notify user of payment failure
        // You could send an email here
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
```