```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Pricing = ({ user, onUpgrade }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        'Up to 3 workspaces',
        '5 boards per workspace',
        'Basic task management',
        'Up to 10 team members',
        'Email support'
      ],
      cta: 'Current Plan',
      current: user?.subscription_tier === 'free',
      disabled: user?.subscription_tier === 'free'
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'per month',
      features: [
        'Unlimited workspaces',
        'Unlimited boards',
        'Advanced task management',
        'Unlimited team members',
        'Priority support',
        'Custom fields & workflows',
        'Advanced analytics',
        'API access'
      ],
      cta: user?.subscription_tier === 'pro' ? 'Current Plan' : 'Upgrade to Pro',
      featured: true,
      current: user?.subscription_tier === 'pro',
      disabled: user?.subscription_tier === 'pro'
    }
  ];

  const handleUpgrade = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('teamflow_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pricing-page">
      <div className="pricing-header">
        <h1>Choose Your Plan</h1>
        <p>Select the perfect plan for your team's needs. All plans include our core features.</p>
        {user && (
          <div className="current-plan-badge">
            Current plan: <strong>{user.subscription_tier.charAt(0).toUpperCase() + user.subscription_tier.slice(1)}</strong>
          </div>
        )}
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <div className="pricing-cards">
        {plans.map((plan, index) => (
          <div 
            key={index} 
            className={`pricing-card ${plan.featured ? 'featured' : ''} ${plan.current ? 'current' : ''}`}
          >
            <h3>{plan.name}</h3>
            <div className="price">
              {plan.price}<span>/{plan.period}</span>
            </div>
            
            <ul className="pricing-features">
              {plan.features.map((feature, idx) => (
                <li key={idx}>
                  <span className="feature-check">✓</span> {feature}
                </li>
              ))}
            </ul>

            <button
              className={`btn ${plan.featured ? 'btn-primary' : 'btn-secondary'} ${plan.disabled ? 'disabled' : ''}`}
              onClick={plan.name === 'Pro' ? handleUpgrade : undefined}
              disabled={plan.disabled || loading}
            >
              {loading && plan.name === 'Pro' ? 'Processing...' : plan.cta}
            </button>

            {plan.current && (
              <div className="current-plan-indicator">
                ✓ Currently active
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pricing-faq">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h3>Can I change plans later?</h3>
            <p>Yes, you can upgrade or downgrade at any time. Changes take effect immediately.</p>
          </div>
          <div className="faq-item">
            <h3>Is there a free trial?</h3>
            <p>The Free plan is always free. For Pro, we offer a 14-day free trial with all features.</p>
          </div>
          <div className="faq-item">
            <h3>What payment methods do you accept?</h3>
            <p>We accept all major credit cards via Stripe. Enterprise customers can request invoice billing.</p>
          </div>
          <div className="faq-item">
            <h3>Can I cancel anytime?</h3>
            <p>Yes, you can cancel your subscription at any time. No long-term contracts.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
```