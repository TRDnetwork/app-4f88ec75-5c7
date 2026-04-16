```javascript
// Additional endpoint to verify checkout session on frontend
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { authenticateToken } = require('../middleware/auth');

router.get('/verify-session', authenticateToken, async (req, res) => {
  try {
    const { session_id } = req.query;
    
    if (!session_id) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    // Verify this session belongs to the current user
    if (session.client_reference_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if payment was successful
    if (session.payment_status === 'paid') {
      // Update user subscription in database
      const pool = req.app.get('pool');
      await pool.query(
        'UPDATE app_4994_users SET subscription_tier = $1 WHERE id = $2',
        ['pro', req.user.id]
      );

      return res.json({
        success: true,
        session: {
          id: session.id,
          payment_status: session.payment_status,
          customer_email: session.customer_details?.email,
          amount_total: session.amount_total / 100 // Convert from cents
        }
      });
    } else {
      return res.status(402).json({ 
        error: 'Payment not completed',
        payment_status: session.payment_status 
      });
    }
  } catch (error) {
    console.error('Session verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
```