import { useState, type FormEvent } from 'react';
import { createPriceAlert } from '../../lib/api';
import { isValidEmail, isValidNigerianPhone, sanitizeInput, RateLimiter } from '../../lib/sanitize';

interface PriceAlertFormProps {
  productId: string;
  locationId?: string;
}

const alertRateLimiter = new RateLimiter(3, 60000); // 3 alerts per minute

export default function PriceAlertForm({ productId, locationId }: PriceAlertFormProps) {
  const [contactType, setContactType] = useState<'email' | 'phone'>('email');
  const [contactValue, setContactValue] = useState('');
  const [thresholdType, setThresholdType] = useState<'percentage' | 'absolute'>('percentage');
  const [thresholdValue, setThresholdValue] = useState('5');
  const [direction, setDirection] = useState<'up' | 'down' | 'both'>('both');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    // Rate limiting
    if (!alertRateLimiter.canProceed()) {
      setStatus('error');
      setErrorMsg('Too many requests. Please wait a moment and try again.');
      return;
    }

    // Validate contact
    const sanitizedContact = sanitizeInput(contactValue.trim());
    if (contactType === 'email' && !isValidEmail(sanitizedContact)) {
      setStatus('error');
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (contactType === 'phone' && !isValidNigerianPhone(sanitizedContact)) {
      setStatus('error');
      setErrorMsg('Please enter a valid Nigerian phone number (e.g., 08012345678).');
      return;
    }

    // Validate threshold
    const threshold = parseFloat(thresholdValue);
    if (isNaN(threshold) || threshold <= 0 || threshold > 1000) {
      setStatus('error');
      setErrorMsg('Please enter a valid threshold value.');
      return;
    }

    setStatus('loading');

    const result = await createPriceAlert({
      product_id: productId,
      location_id: locationId || null,
      contact_type: contactType,
      contact_value: sanitizedContact,
      threshold_type: thresholdType,
      threshold_value: threshold,
      direction,
    });

    if (result.success) {
      setStatus('success');
      setContactValue('');
      setThresholdValue('5');
    } else {
      setStatus('error');
      setErrorMsg(result.error || 'Something went wrong. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <div className="card-body">
        <div className="message message-success">
          Alert created successfully! You'll be notified when the price changes.
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => setStatus('idle')}
          style={{ width: '100%' }}
        >
          Create Another Alert
        </button>
      </div>
    );
  }

  return (
    <div className="card-body">
      <form className="alert-form" onSubmit={handleSubmit}>
        {status === 'error' && errorMsg && (
          <div className="message message-error">{errorMsg}</div>
        )}

        <div>
          <label>Contact Method</label>
          <select
            value={contactType}
            onChange={e => setContactType(e.target.value as 'email' | 'phone')}
          >
            <option value="email">Email</option>
            <option value="phone">Phone (SMS)</option>
          </select>
        </div>

        <div>
          <label>{contactType === 'email' ? 'Email Address' : 'Phone Number'}</label>
          <input
            type={contactType === 'email' ? 'email' : 'tel'}
            value={contactValue}
            onChange={e => setContactValue(e.target.value)}
            placeholder={contactType === 'email' ? 'you@example.com' : '08012345678'}
            required
            maxLength={254}
          />
        </div>

        <div>
          <label>Alert When Price Changes By</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="number"
              value={thresholdValue}
              onChange={e => setThresholdValue(e.target.value)}
              min="0.1"
              max="1000"
              step="0.1"
              required
              style={{ flex: 1 }}
            />
            <select
              value={thresholdType}
              onChange={e => setThresholdType(e.target.value as 'percentage' | 'absolute')}
              style={{ width: '120px' }}
            >
              <option value="percentage">Percent (%)</option>
              <option value="absolute">Naira (₦)</option>
            </select>
          </div>
        </div>

        <div>
          <label>Direction</label>
          <select
            value={direction}
            onChange={e => setDirection(e.target.value as 'up' | 'down' | 'both')}
          >
            <option value="both">Price goes up or down</option>
            <option value="up">Price goes up only</option>
            <option value="down">Price goes down only</option>
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={status === 'loading'}
          style={{ width: '100%' }}
        >
          {status === 'loading' ? 'Creating Alert...' : 'Create Price Alert'}
        </button>
      </form>
    </div>
  );
}
