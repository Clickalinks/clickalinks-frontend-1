import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './AppStorePreview.css';

const formatCount = (count) => {
  if (!count && count !== 0) return '';
  if (count >= 1000000) {
    const millions = count / 1000000;
    return `${millions >= 10 ? Math.round(millions) : millions.toFixed(1)}M`;
  }
  if (count >= 10000) return `${Math.round(count / 1000)}K`;
  return count.toLocaleString('en-GB');
};

const Stars = ({ value }) => {
  const score = Math.max(0, Math.min(5, Number(value) || 0));
  const full = Math.floor(score);
  const half = score - full >= 0.3 && full < 5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="store-stars" aria-hidden="true">
      <span className="store-stars-filled">{'★★★★★'.slice(0, full)}</span>
      {half && <span className="store-stars-half">★</span>}
      <span className="store-stars-empty">{'★★★★★'.slice(0, empty)}</span>
    </span>
  );
};

export const storeDestination = (app) => {
  const agent = navigator.userAgent || '';
  const android = /Android/i.test(agent);
  const ios = /iPhone|iPad|iPod/i.test(agent);

  if (android && app.playStoreUrl) {
    return { href: app.playStoreUrl, storeName: 'Google Play' };
  }
  if (ios && app.appStoreUrl) {
    return { href: app.appStoreUrl, storeName: 'App Store' };
  }
  if (app.appStoreUrl && app.playStoreUrl) {
    return {
      href: app.appStoreUrl,
      storeName: 'App Store',
      alt: { href: app.playStoreUrl, label: 'Google Play' }
    };
  }
  if (app.appStoreUrl) return { href: app.appStoreUrl, storeName: 'App Store' };
  if (app.playStoreUrl) return { href: app.playStoreUrl, storeName: 'Google Play' };
  return null;
};

const AppStorePreview = ({
  app,
  anchorRect,
  pinned,
  sheet,
  onClose,
  onPointerEnter,
  onPointerLeave,
  onGet
}) => {
  const cardRef = useRef(null);
  const closeRef = useRef(null);
  const [position, setPosition] = useState(null);
  const destination = storeDestination(app);
  const reviews = Array.isArray(app.reviews) ? app.reviews.slice(0, 2) : [];

  useLayoutEffect(() => {
    if (sheet) {
      setPosition(null);
      return;
    }
    const card = cardRef.current;
    if (!card || !anchorRect) return;

    const width = card.offsetWidth;
    const height = card.offsetHeight;
    const gap = 12;
    const margin = 12;
    let left = anchorRect.right + gap;
    if (left + width > window.innerWidth - margin) {
      left = anchorRect.left - width - gap;
    }
    if (left < margin) left = margin;

    let top = anchorRect.top + (anchorRect.height / 2) - (height / 2);
    const maxTop = window.innerHeight - height - margin;
    top = Math.min(Math.max(margin, top), Math.max(margin, maxTop));
    setPosition({ left, top });
  }, [anchorRect, sheet, app.name]);

  useEffect(() => {
    if (pinned || sheet) closeRef.current?.focus();
  }, [pinned, sheet, app.name]);

  const openStore = (event, url) => {
    if (!url) {
      event.preventDefault();
      return;
    }
    onGet(url);
  };

  const popStyle = !sheet && position
    ? { left: `${position.left}px`, top: `${position.top}px`, visibility: 'visible' }
    : undefined;

  return (
    <>
      {(pinned || sheet) && (
        <button
          type="button"
          className="store-card-backdrop"
          aria-label="Close app details"
          onClick={onClose}
        />
      )}
      <article
        ref={cardRef}
        className={`store-card ${sheet ? 'store-card-sheet' : 'store-card-pop'} ${!sheet && position ? 'is-placed' : ''}`}
        style={popStyle}
        role="dialog"
        aria-modal={pinned || sheet ? 'true' : 'false'}
        aria-label={`${app.name} details`}
        onMouseEnter={onPointerEnter}
        onMouseLeave={onPointerLeave}
      >
        <button
          ref={closeRef}
          type="button"
          className="store-card-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        {app.sample && <p className="store-card-sample">Sample preview</p>}

        <header className="store-card-header">
          {app.icon ? (
            <img className="store-card-icon" src={app.icon} alt="" />
          ) : (
            <div className="store-card-icon store-card-icon-fallback" aria-hidden="true">
              {(app.name || 'A').slice(0, 1)}
            </div>
          )}
          <div className="store-card-identity">
            <h2>{app.name}</h2>
            <p className="store-card-developer">{app.developer}</p>
            <div className="store-card-actions">
              {destination ? (
                <a
                  className="store-get"
                  href={destination.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => openStore(event, destination.href)}
                >
                  Get
                </a>
              ) : (
                <span className="store-get is-disabled">Get</span>
              )}
              {destination?.alt && (
                <a
                  className="store-get-alt"
                  href={destination.alt.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => openStore(event, destination.alt.href)}
                >
                  {destination.alt.label}
                </a>
              )}
            </div>
          </div>
        </header>

        <div className="store-stats">
          <div>
            <span className="store-stat-label">{app.ratingCount ? `${formatCount(app.ratingCount)} ratings` : 'Ratings'}</span>
            <strong>{app.rating ? app.rating.toFixed(1) : '—'}</strong>
            {app.rating ? <Stars value={app.rating} /> : null}
          </div>
          <div>
            <span className="store-stat-label">Age</span>
            <strong>{app.ageRating || '—'}</strong>
            <span className="store-stat-note">Years</span>
          </div>
          <div>
            <span className="store-stat-label">Category</span>
            <strong className="store-stat-category">{app.category || 'Games'}</strong>
          </div>
        </div>

        {app.screenshots?.length > 0 && (
          <div className="store-shots" tabIndex={0} aria-label="Screenshots">
            {app.screenshots.map((src, index) => (
              <img key={`${app.name}-shot-${index}`} src={src} alt={`${app.name} screenshot ${index + 1}`} />
            ))}
          </div>
        )}

        {app.description && <p className="store-description">{app.description}</p>}

        <section className="store-reviews">
          <h3>Ratings and reviews</h3>
          {app.rating ? (
            <div className="store-review-summary">
              <strong>{app.rating.toFixed(1)}</strong>
              <div>
                <Stars value={app.rating} />
                <span>{app.ratingCount ? `${formatCount(app.ratingCount)} ratings` : 'Store rating'}</span>
              </div>
            </div>
          ) : null}
          {reviews.map((review) => (
            <blockquote key={`${review.author}-${review.title}`}>
              <div className="store-review-top">
                <strong>{review.title}</strong>
                <Stars value={review.stars} />
              </div>
              <cite>{review.author}</cite>
              <p>{review.text}</p>
            </blockquote>
          ))}
          {reviews.length === 0 && (
            <p className="store-review-link">Written reviews open on the store when you press Get.</p>
          )}
        </section>
      </article>
    </>
  );
};

export default AppStorePreview;
