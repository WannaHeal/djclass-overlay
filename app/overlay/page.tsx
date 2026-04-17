'use client';

import { useEffect, useState, useRef, Suspense, useCallback } from 'react';
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

const POLLING_INTERVAL = 30000;

const buttonModeLabels: Record<string, string> = {
  '4': '4B',
  '5': '5B',
  '6': '6B',
  '8': '8B',
};

interface DJClassLevel {
  className: string;
  level: string;
  requiredPower: number;
  fullName: string;
}

const djClassProgression: DJClassLevel[] = [
  { className: 'BEGINNER', level: '', requiredPower: 0, fullName: 'BEGINNER' },
  { className: 'TRAINEE', level: 'IV', requiredPower: 500, fullName: 'TRAINEE IV' },
  { className: 'TRAINEE', level: 'III', requiredPower: 1000, fullName: 'TRAINEE III' },
  { className: 'TRAINEE', level: 'II', requiredPower: 1500, fullName: 'TRAINEE II' },
  { className: 'TRAINEE', level: 'I', requiredPower: 2000, fullName: 'TRAINEE I' },
  { className: 'AMATEUR', level: 'IV', requiredPower: 2400, fullName: 'AMATEUR IV' },
  { className: 'AMATEUR', level: 'III', requiredPower: 2800, fullName: 'AMATEUR III' },
  { className: 'AMATEUR', level: 'II', requiredPower: 3200, fullName: 'AMATEUR II' },
  { className: 'AMATEUR', level: 'I', requiredPower: 3600, fullName: 'AMATEUR I' },
  { className: 'ROOKIE', level: 'IV', requiredPower: 4000, fullName: 'ROOKIE IV' },
  { className: 'ROOKIE', level: 'III', requiredPower: 4300, fullName: 'ROOKIE III' },
  { className: 'ROOKIE', level: 'II', requiredPower: 4600, fullName: 'ROOKIE II' },
  { className: 'ROOKIE', level: 'I', requiredPower: 4900, fullName: 'ROOKIE I' },
  { className: 'STREET DJ', level: 'IV', requiredPower: 5200, fullName: 'STREET DJ IV' },
  { className: 'STREET DJ', level: 'III', requiredPower: 5500, fullName: 'STREET DJ III' },
  { className: 'STREET DJ', level: 'II', requiredPower: 5800, fullName: 'STREET DJ II' },
  { className: 'STREET DJ', level: 'I', requiredPower: 6000, fullName: 'STREET DJ I' },
  { className: 'MIDDLEMAN', level: 'IV', requiredPower: 6200, fullName: 'MIDDLEMAN IV' },
  { className: 'MIDDLEMAN', level: 'III', requiredPower: 6400, fullName: 'MIDDLEMAN III' },
  { className: 'MIDDLEMAN', level: 'II', requiredPower: 6600, fullName: 'MIDDLEMAN II' },
  { className: 'MIDDLEMAN', level: 'I', requiredPower: 6800, fullName: 'MIDDLEMAN I' },
  { className: 'PRO DJ', level: 'IV', requiredPower: 7000, fullName: 'PRO DJ IV' },
  { className: 'PRO DJ', level: 'III', requiredPower: 7200, fullName: 'PRO DJ III' },
  { className: 'PRO DJ', level: 'II', requiredPower: 7400, fullName: 'PRO DJ II' },
  { className: 'PRO DJ', level: 'I', requiredPower: 7600, fullName: 'PRO DJ I' },
  { className: 'HIGH CLASS', level: 'IV', requiredPower: 7800, fullName: 'HIGH CLASS IV' },
  { className: 'HIGH CLASS', level: 'III', requiredPower: 8000, fullName: 'HIGH CLASS III' },
  { className: 'HIGH CLASS', level: 'II', requiredPower: 8200, fullName: 'HIGH CLASS II' },
  { className: 'HIGH CLASS', level: 'I', requiredPower: 8400, fullName: 'HIGH CLASS I' },
  { className: 'PROFESSIONAL', level: 'IV', requiredPower: 8600, fullName: 'PROFESSIONAL IV' },
  { className: 'PROFESSIONAL', level: 'III', requiredPower: 8700, fullName: 'PROFESSIONAL III' },
  { className: 'PROFESSIONAL', level: 'II', requiredPower: 8800, fullName: 'PROFESSIONAL II' },
  { className: 'PROFESSIONAL', level: 'I', requiredPower: 8900, fullName: 'PROFESSIONAL I' },
  { className: 'TREND SETTER', level: 'IV', requiredPower: 9000, fullName: 'TREND SETTER IV' },
  { className: 'TREND SETTER', level: 'III', requiredPower: 9100, fullName: 'TREND SETTER III' },
  { className: 'TREND SETTER', level: 'II', requiredPower: 9200, fullName: 'TREND SETTER II' },
  { className: 'TREND SETTER', level: 'I', requiredPower: 9300, fullName: 'TREND SETTER I' },
  { className: 'HEADLINER', level: 'IV', requiredPower: 9400, fullName: 'HEADLINER IV' },
  { className: 'HEADLINER', level: 'III', requiredPower: 9500, fullName: 'HEADLINER III' },
  { className: 'HEADLINER', level: 'II', requiredPower: 9600, fullName: 'HEADLINER II' },
  { className: 'HEADLINER', level: 'I', requiredPower: 9650, fullName: 'HEADLINER I' },
  { className: 'SHOWSTOPPER', level: 'IV', requiredPower: 9700, fullName: 'SHOWSTOPPER IV' },
  { className: 'SHOWSTOPPER', level: 'III', requiredPower: 9750, fullName: 'SHOWSTOPPER III' },
  { className: 'SHOWSTOPPER', level: 'II', requiredPower: 9800, fullName: 'SHOWSTOPPER II' },
  { className: 'SHOWSTOPPER', level: 'I', requiredPower: 9850, fullName: 'SHOWSTOPPER I' },
  { className: 'BEAT MAESTRO', level: 'IV', requiredPower: 9900, fullName: 'BEAT MAESTRO IV' },
  { className: 'BEAT MAESTRO', level: 'III', requiredPower: 9930, fullName: 'BEAT MAESTRO III' },
  { className: 'BEAT MAESTRO', level: 'II', requiredPower: 9950, fullName: 'BEAT MAESTRO II' },
  { className: 'BEAT MAESTRO', level: 'I', requiredPower: 9970, fullName: 'BEAT MAESTRO I' },
  { className: 'THE LORD OF DJMAX', level: '', requiredPower: 9980, fullName: 'THE LORD OF DJMAX' },
];

function getNextDJClassTarget(currentClassFullName: string): DJClassLevel | null {
  const currentIndex = djClassProgression.findIndex(c => c.fullName === currentClassFullName);
  if (currentIndex === -1 || currentIndex === djClassProgression.length - 1) {
    return null;
  }
  return djClassProgression[currentIndex + 1];
}

function calculateDJClassFromPoints(points: number): DJClassLevel {
  for (let i = djClassProgression.length - 1; i >= 0; i--) {
    if (points >= djClassProgression[i].requiredPower) {
      return djClassProgression[i];
    }
  }
  return djClassProgression[0];
}

// Simple number display without animation issues
function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const startValueRef = useRef(value);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    // Skip animation if value hasn't changed
    if (value === startValueRef.current) return;

    const startValue = startValueRef.current;
    const endValue = value;
    const startTime = performance.now();

    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startValue + (endValue - startValue) * easeOut;
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete - update start value for next transition
        startValueRef.current = endValue;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

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

// Particle for firework effect
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  decay: number;
  size: number;
}

function FireworkEffect({ isActive }: { isActive: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const isActiveRef = useRef(isActive);

  useEffect(() => {
    isActiveRef.current = isActive;
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    const createExplosion = (x: number, y: number, color: string) => {
      const particleCount = 30 + Math.random() * 20;
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
        const velocity = 3 + Math.random() * 4;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          color,
          alpha: 1,
          decay: 0.015 + Math.random() * 0.01,
          size: 2 + Math.random() * 3,
        });
      }
    };

    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe'];

    let frameCount = 0;
    const animate = () => {
      if (!isActiveRef.current) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particlesRef.current = [];
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (frameCount < 180 && frameCount % 20 === 0) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.6;
        const color = colors[Math.floor(Math.random() * colors.length)];
        createExplosion(x, y, color);
      }

      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.1;
        particle.alpha -= particle.decay;

        if (particle.alpha > 0) {
          ctx.globalAlpha = particle.alpha;
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          return true;
        }
        return false;
      });

      frameCount++;

      if (frameCount < 240 || particlesRef.current.length > 0) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    particlesRef.current = [];
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className={styles.fireworkCanvas}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    />
  );
}

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
  
  const [previousGrade, setPreviousGrade] = useState<string>('');
  const previousGradeRef = useRef<string>('');
  const [showFirework, setShowFirework] = useState(false);
  const [isNewRank, setIsNewRank] = useState(false);
  const fireworkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Keep ref in sync with state
  useEffect(() => {
    previousGradeRef.current = previousGrade;
  }, [previousGrade]);
  
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  
  // Use a ref for the input value to ensure we always get current value
  const inputRef = useRef<HTMLInputElement>(null);
  // Track the input value in state for preview
  const [inputValue, setInputValue] = useState<string>('');

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

  // Update input value only when panel opens (not when data changes)
  useEffect(() => {
    if (showDebugPanel && data && inputValue === '') {
      // Only set initial value when panel first opens
      const value = data.point.toFixed(4);
      setInputValue(value);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDebugPanel]);

  const triggerRankUpEffect = useCallback(() => {
    setShowFirework(true);
    setIsNewRank(true);

    if (fireworkTimeoutRef.current) {
      clearTimeout(fireworkTimeoutRef.current);
    }
    fireworkTimeoutRef.current = setTimeout(() => {
      setShowFirework(false);
      setIsNewRank(false);
    }, 4000);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setShowDebugPanel(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const applySimulation = useCallback(() => {
    const rawValue = inputRef.current?.value || inputValue;
    if (!rawValue) return;
    
    const newPoints = parseFloat(rawValue);
    if (isNaN(newPoints)) return;

    const newGrade = calculateDJClassFromPoints(newPoints).fullName;
    const currentGrade = data?.grade || '';
    const hasRankChanged = newGrade !== currentGrade;

    // Update data state directly
    setData(prevData => {
      if (!prevData) return prevData;
      return {
        ...prevData,
        grade: newGrade,
        point: newPoints,
      };
    });

    // Update tracking states
    setPreviousGrade(newGrade);
    previousGradeRef.current = newGrade;
    setIsSimulationMode(true);

    // Trigger animation if rank changed
    if (hasRankChanged) {
      triggerRankUpEffect();
    }
  }, [data?.grade, inputValue, triggerRankUpEffect]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    if (isSimulationMode) return;

    try {
      const apiUrl = `/api/djclass?user=${encodeURIComponent(user)}&mode=${mode}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' })) as { error: string };
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const apiData = await response.json() as VArchiveResponse;

      if (apiData && apiData.djClass && typeof apiData.djPowerConversion === 'number') {
        const effectiveGrade = apiData.djClass;
        const effectivePoint = apiData.djPowerConversion;
        
        const newData: DJClassData = {
          user,
          mode,
          grade: effectiveGrade,
          point: effectivePoint,
        };
        
        // Trigger firework on rank change, or on first load if at MAX tier
        const isFirstLoad = !previousGradeRef.current;
        const isMaxTier = effectiveGrade === 'THE LORD OF DJMAX';
        const hasRankChanged = previousGradeRef.current !== effectiveGrade;
        
        if ((isFirstLoad && isMaxTier) || (!isFirstLoad && hasRankChanged)) {
          triggerRankUpEffect();
        }
        
        // Update both state and ref immediately to keep them in sync
        setPreviousGrade(effectiveGrade);
        previousGradeRef.current = effectiveGrade;
        setData(newData);
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
  }, [user, mode, triggerRankUpEffect, isSimulationMode]);

  // Initial fetch and polling setup
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchData();

    // Set up polling interval
    const intervalId = setInterval(fetchData, POLLING_INTERVAL);

    return () => {
      clearInterval(intervalId);
      if (fireworkTimeoutRef.current) {
        clearTimeout(fireworkTimeoutRef.current);
      }
    };
  }, [user, mode, fetchData]);

  // Fetch when exiting simulation mode
  useEffect(() => {
    if (!isSimulationMode && user) {
      // Simulation mode was just turned off - fetch fresh data after a short delay
      const timeout = setTimeout(() => {
        fetchData();
      }, 100);
      return () => clearTimeout(timeout);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSimulationMode]);

  const calculatedGrade = inputValue 
    ? calculateDJClassFromPoints(parseFloat(inputValue)).fullName 
    : (data?.grade || '');

  if (isInitialized && !user) {
    return (
      <div className={styles.overlay}>
        <div className={styles.error}>Error: No username provided</div>
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
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  const nextTarget = data ? getNextDJClassTarget(data.grade) : null;

  return (
    <>
      <FireworkEffect isActive={showFirework} />
      <div className={styles.overlay}>
        <div className={styles.container}>
          <div className={`${styles.topSection} ${isNewRank ? styles.rankGlowBorder : ''}`}>
            <div className={styles.userInfo}>
              <span className={styles.username}>{data?.user || user}</span>
              <span className={styles.separator}>|</span>
              <span className={styles.modeInfo}>
                {buttonModeLabels[mode]}
                {data && (
                  <>
                    <span className={styles.gradeSeparator}>::</span>
                    <span className={`${styles.grade} ${isNewRank ? styles.rankPulse : ''}`}>
                      {data.grade}
                    </span>
                  </>
                )}
              </span>
            </div>
          </div>

          <div className={`${styles.bottomSection} ${isNewRank ? styles.rankGlowBorder : ''}`}>
            {data ? (
              <>
                <div className={styles.pointContainer}>
                  <AnimatedNumber value={data.point} />
                  <span className={styles.pointLabel}>PTS</span>
                </div>
                
                {nextTarget ? (
                  <div className={`${styles.nextTarget} ${isNewRank ? styles.rankGlow : ''}`}>
                    <span className={styles.nextLabel}>NEXT: </span>
                    <span className={styles.nextClassName}>{nextTarget.className}</span>
                    {nextTarget.level && (
                      <span className={styles.nextLevel}> {nextTarget.level}</span>
                    )}
                    <span className={styles.targetLabel}> (TARGET: </span>
                    <span className={styles.targetPower}>{nextTarget.requiredPower.toFixed(4)}</span>
                    <span className={styles.targetLabel}>)</span>
                  </div>
                ) : (
                  <div className={`${styles.nextTarget} ${isNewRank ? styles.rankGlow : ''}`}>
                    <span className={styles.maxClass}>MAX CLASS REACHED</span>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.noData}>No data available</div>
            )}
          </div>

          {lastUpdated && (
            <div className={styles.lastUpdated}>
              Updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {showDebugPanel && (
        <div
          style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.9)',
            border: '2px solid #667eea',
            borderRadius: '8px',
            padding: '16px',
            color: '#fff',
            fontFamily: 'monospace',
            fontSize: '12px',
            zIndex: 9999,
            minWidth: '280px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <strong style={{ color: '#667eea' }}>🔧 Simulation Panel</strong>
            <button
              onClick={() => setShowDebugPanel(false)}
              style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '16px' }}
            >
              ×
            </button>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', color: '#aaa' }}>DJ Power Points:</label>
            <input
              ref={inputRef}
              type="number"
              step="0.0001"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter points..."
              style={{
                width: '100%',
                padding: '6px',
                background: '#333',
                border: '1px solid #555',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '11px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {inputValue && (
            <div style={{ marginBottom: '12px', padding: '8px', background: '#1a1a2e', borderRadius: '4px', border: '1px solid #667eea' }}>
              <div style={{ fontSize: '10px', color: '#888', marginBottom: '2px' }}>Calculated DJ Class:</div>
              <div style={{ fontSize: '14px', color: '#667eea', fontWeight: 'bold' }}>{calculatedGrade}</div>
            </div>
          )}

          <button
            onClick={applySimulation}
            style={{
              width: '100%',
              padding: '8px',
              background: '#667eea',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              marginBottom: '8px',
            }}
          >
            Apply & Animate
          </button>

          {isSimulationMode && (
            <button
              onClick={() => setIsSimulationMode(false)}
              style={{
                width: '100%',
                padding: '8px',
                background: '#444',
                border: '1px solid #666',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              Resume API Polling
            </button>
          )}

          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #444', fontSize: '10px', color: '#888' }}>
            {isSimulationMode ? (
              <span style={{ color: '#f9ca24' }}>⚠️ Simulation Mode Active - API polling paused</span>
            ) : (
              <span>Press Ctrl+Shift+D to toggle</span>
            )}
          </div>

          <details style={{ marginTop: '12px' }}>
            <summary style={{ cursor: 'pointer', color: '#667eea', fontSize: '10px' }}>
              📋 Tier Cutoffs Reference
            </summary>
            <div style={{ marginTop: '8px', maxHeight: '150px', overflowY: 'auto', fontSize: '9px' }}>
              {[...djClassProgression].reverse().map((tier) => (
                <div key={tier.fullName} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: '1px solid #333' }}>
                  <span style={{ color: '#aaa' }}>{tier.fullName}</span>
                  <span style={{ color: '#667eea' }}>≥ {tier.requiredPower}</span>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </>
  );
}

function OverlayLoading() {
  return (
    <div className={styles.overlay}>
      <div className={styles.loading}>Loading overlay...</div>
    </div>
  );
}

export default function Overlay() {
  return (
    <Suspense fallback={<OverlayLoading />}>
      <OverlayContent />
    </Suspense>
  );
}
