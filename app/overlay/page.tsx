'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './overlay.module.css';

interface DJClassData {
  user: string;
  mode: string;
  grade: string;
  point: number;
}

interface VArchiveResponse {
  djClass: string;
  djPowerConversion: number;
}

const POLLING_INTERVAL = 30000; // 30 seconds

const buttonModeLabels: Record<string, string> = {
  '4': '4B',
  '5': '5B',
  '6': '6B',
  '8': '8B',
};

// Animated number component
function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [previousValue, setPreviousValue] = useState(value);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (value === previousValue) return;

    const startValue = previousValue;
    const endValue = value;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startValue + (endValue - startValue) * easeOut;
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setPreviousValue(value);
      }
    };

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration, previousValue]);

  const integerPart = Math.floor(displayValue);
  const decimalPart = Math.floor((displayValue % 1) * 10000);

  return (
    <span className={styles.animatedNumber}>
      <span className={styles.integer}>{integerPart.toLocaleString()}</span>
      <span className={styles.decimalSeparator}>.</span>
      <span className={styles.decimal}>{decimalPart.toString().padStart(4, '0')}</span>
    </span>
  );
}

// Main overlay component that uses useSearchParams
function OverlayContent() {
  const searchParams = useSearchParams();
  const encodedUser = searchParams.get('user');
  const mode = searchParams.get('mode') || '4';
  
  const [user, setUser] = useState<string>('');
  const [data, setData] = useState<DJClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Decode username from URL
  useEffect(() => {
    if (encodedUser) {
      try {
        const decoded = decodeURIComponent(encodedUser);
        setUser(decoded);
      } catch {
        setUser(encodedUser);
      }
    }
    setIsInitialized(true);
  }, [encodedUser]);

  // Fetch data from internal API endpoint (server-side proxy to avoid CORS)
  const fetchData = async () => {
    if (!user) return;

    try {
      // Internal API endpoint that proxies to V-Archive
      const apiUrl = `/api/djclass?user=${encodeURIComponent(user)}&mode=${mode}`;

      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' })) as { error: string };
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const apiData = await response.json() as VArchiveResponse;

      // Handle the API response format
      // Based on the API reference, the response should have grade and point
      if (apiData && apiData.djClass && typeof apiData.djPowerConversion === 'number') {
        setData({
          user,
          mode,
          grade: apiData.djClass,
          point: apiData.djPowerConversion,
        });
        setLastUpdated(new Date());
        setError(null);
      } else {
        throw new Error('Invalid data format from API');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and polling
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchData();

    // Set up polling
    const intervalId = setInterval(fetchData, POLLING_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [user, mode]);

  if (isInitialized && !user) {
    return (
      <div className={styles.overlay}>
        <div className={styles.error}>
          Error: No username provided
        </div>
      </div>
    );
  }

  if (!isInitialized || loading) {
    return (
      <div className={styles.overlay}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.overlay}>
        <div className={styles.error}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        {/* Top section: Username and Button Mode + Grade */}
        <div className={styles.topSection}>
          <div className={styles.userInfo}>
            <span className={styles.username}>{data?.user || user}</span>
            <span className={styles.separator}>|</span>
            <span className={styles.modeInfo}>
              {buttonModeLabels[mode]}
              {data && (
                <>
                  <span className={styles.gradeSeparator}>::</span>
                  <span className={styles.grade}>{data.grade}</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Bottom section: Point value */}
        <div className={styles.bottomSection}>
          {data ? (
            <div className={styles.pointContainer}>
              <AnimatedNumber value={data.point} />
              <span className={styles.pointLabel}>PTS</span>
            </div>
          ) : (
            <div className={styles.noData}>No data available</div>
          )}
        </div>

        {/* Last updated indicator */}
        {lastUpdated && (
          <div className={styles.lastUpdated}>
            Updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}

// Loading fallback for Suspense
function OverlayLoading() {
  return (
    <div className={styles.overlay}>
      <div className={styles.loading}>Loading overlay...</div>
    </div>
  );
}

// Export the page wrapped in Suspense
export default function Overlay() {
  return (
    <Suspense fallback={<OverlayLoading />}>
      <OverlayContent />
    </Suspense>
  );
}
