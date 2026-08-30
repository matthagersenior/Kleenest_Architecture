import React from 'react';
import { CONSUMER_MEMBERSHIP_PRICE_USD } from './consumerMonetization.js';

export default function ConsumerMonetizationBanner({ membershipTier = 'free', onUpgrade }) {
  const premium = String(membershipTier).toLowerCase() === 'premium';

  return (
    <section className={`consumer-monetization ${premium ? 'is-premium' : 'is-free'}`} aria-label="Kleenest membership">
      <div>
        <strong>{premium ? 'Kleenest Premium' : 'Kleenest Free'}</strong>
        <p>
          {premium
            ? 'Your complete Kleenest experience, without ads.'
            : 'Your complete Kleenest experience, supported by tasteful ads.'}
        </p>
      </div>
      {!premium && onUpgrade ? (
        <button type="button" className="button secondary consumer-monetization-action" onClick={onUpgrade}>
          Remove ads · ${CONSUMER_MEMBERSHIP_PRICE_USD} one time
        </button>
      ) : null}
    </section>
  );
}
