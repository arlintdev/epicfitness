import { ReactNode } from 'react';
import { FaSync } from 'react-icons/fa';
import usePullToRefresh from '../../hooks/usePullToRefresh';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const { pullDistance, isRefreshing, canRefresh } = usePullToRefresh({
    onRefresh,
    threshold: 80,
  });

  const opacity = Math.min(pullDistance / 80, 1);
  const scale = 0.8 + (0.2 * Math.min(pullDistance / 80, 1));
  const rotation = pullDistance * 3;

  return (
    <div className="relative">
      {/* Pull to Refresh Indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex justify-center overflow-hidden pointer-events-none z-40"
        style={{
          height: `${pullDistance}px`,
          transition: !isRefreshing && pullDistance === 0 ? 'height 0.2s ease-out' : 'none',
        }}
      >
        <div
          className="flex items-center justify-center"
          style={{
            opacity,
            transform: `scale(${scale})`,
            marginTop: `${Math.max(0, pullDistance - 40)}px`,
          }}
        >
          <div
            className={`p-3 rounded-full ${
              canRefresh ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
            } shadow-lg transition-colors duration-200`}
          >
            <FaSync
              className={`h-6 w-6 text-white ${isRefreshing ? 'animate-spin' : ''}`}
              style={{
                transform: !isRefreshing ? `rotate(${rotation}deg)` : undefined,
              }}
            />
          </div>
        </div>
      </div>

      {/* Refresh Status Text */}
      {pullDistance > 20 && (
        <div
          className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none z-40"
          style={{
            marginTop: `${pullDistance + 10}px`,
            opacity: opacity * 0.8,
          }}
        >
          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {isRefreshing
              ? 'Refreshing...'
              : canRefresh
              ? 'Release to refresh'
              : 'Pull to refresh'}
          </span>
        </div>
      )}

      {/* Main Content */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: !isRefreshing && pullDistance === 0 ? 'transform 0.2s ease-out' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}