'use client';

import { useState, useCallback } from 'react';
import styles from './page.module.css';

const BUTTON_MODES = [
  { value: '4', label: '4B (4 Buttons)' },
  { value: '5', label: '5B (5 Buttons)' },
  { value: '6', label: '6B (6 Buttons)' },
  { value: '8', label: '8B (8 Buttons)' },
];

export default function Home() {
  const [username, setUsername] = useState('');
  const [buttonMode, setButtonMode] = useState('4');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const generateUrl = useCallback(() => {
    if (!username.trim()) return;
    
    const baseUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/overlay`
      : '/overlay';
    
    const params = new URLSearchParams({
      user: encodeURIComponent(username.trim()),
      mode: buttonMode,
    });
    
    const url = `${baseUrl}?${params.toString()}`;
    setGeneratedUrl(url);
  }, [username, buttonMode]);

  const copyToClipboard = useCallback(async () => {
    if (!generatedUrl) return;
    
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [generatedUrl]);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>DJ CLASS OBS Overlay Generator</h1>
        <p className={styles.description}>
          Generate an overlay URL for OBS to display your V-Archive DJ CLASS information
        </p>

        <div className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>
              V-Archive Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your V-Archive username"
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="buttonMode" className={styles.label}>
              Button Mode
            </label>
            <select
              id="buttonMode"
              value={buttonMode}
              onChange={(e) => setButtonMode(e.target.value)}
              className={styles.select}
            >
              {BUTTON_MODES.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={generateUrl}
            disabled={!username.trim()}
            className={styles.button}
          >
            Generate Overlay URL
          </button>
        </div>

        {generatedUrl && (
          <div className={styles.result}>
            <h2 className={styles.resultTitle}>Your Overlay URL:</h2>
            <div className={styles.urlBox}>
              <code className={styles.url}>{generatedUrl}</code>
              <button
                onClick={copyToClipboard}
                className={styles.copyButton}
              >
                {copied ? 'Copied!' : 'Copy URL'}
              </button>
            </div>
            <p className={styles.hint}>
              Copy this URL and add it as a Browser Source in OBS
            </p>
          </div>
        )}

        <div className={styles.instructions}>
          <h2 className={styles.instructionsTitle}>How to use in OBS:</h2>
          <ol className={styles.steps}>
            <li>Generate your overlay URL above</li>
            <li>Copy the generated URL</li>
            <li>In OBS, click the + button in Sources</li>
            <li>Select &quot;Browser&quot; source type</li>
            <li>Name your source and click OK</li>
            <li>Paste the URL in the URL field</li>
            <li>Set Width to 400 and Height to 200 (adjust as needed)</li>
            <li>Click OK to add the overlay</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
