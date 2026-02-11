import React from 'react';
import './Skeleton.css';

/**
 * Reusable skeleton loading placeholders for master-detail cards.
 * Use count to render multiple card skeletons.
 */
export function CardSkeleton() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-card__image" />
      <div className="skeleton-card__content">
        <div className="skeleton-card__line skeleton-card__title" />
        <div className="skeleton-card__line skeleton-card__text" />
        <div className="skeleton-card__line skeleton-card__text short" />
        <div className="skeleton-card__footer">
          <div className="skeleton-card__badge" />
          <div className="skeleton-card__line skeleton-card__meta" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export default CardSkeleton;
