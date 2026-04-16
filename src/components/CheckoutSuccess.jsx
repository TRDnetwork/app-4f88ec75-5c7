```jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError('No session ID found');
        setLoading(false);
        return;
      }

      try {
        // Verify payment with backend
        const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('teamflow_token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to verify payment');
        }

        // Update local user state
        const userData = JSON.parse(localStorage.getItem('teamflow_user') || '{}');
        userData.subscription_tier = 'pro';
        localStorage.setItem('teamflow_user', JSON.stringify(userData));

        // Show success message
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);

      } catch (err) {
        setError(err.message || 'Payment verification failed');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, navigate]);

  if (loading) {
    return (
      <div className="checkout-status">
        <div className="loading-spinner"></div>
        <h2>Verifying your payment...</h2>
        <p>Please wait while we confirm your subscription.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-status error">
        <h2>Payment Verification Failed</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate('/pricing')}>
          Back to Pricing
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-status success">
      <div className="success-icon">✓</div>
      <h2>Payment Successful!</h2>
      <p>Your Pro subscription has been activated. You now have access to all premium features.</p>
      <p>Redirecting to dashboard...</p>
      <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
        Go to Dashboard Now
      </button>
    </div>
  );
};

export default CheckoutSuccess;
```