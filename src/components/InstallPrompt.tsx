'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed this session
    if (sessionStorage.getItem('pwa-install-dismissed')) return;

    // Check if already installed (standalone mode)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true;
    if (isStandalone) return;

    // Android / Chrome: listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS: detect Safari on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isSafari = /Safari/.test(navigator.userAgent) && !/CriOS|FxiOS|OPiOS|EdgiOS/.test(navigator.userAgent);
    if (isIOS && isSafari) {
      // Small delay so it doesn't flash on load
      setTimeout(() => setShowIOSPrompt(true), 2000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
    dismiss();
  };

  const dismiss = () => {
    setDismissed(true);
    setShowIOSPrompt(false);
    setDeferredPrompt(null);
    sessionStorage.setItem('pwa-install-dismissed', '1');
  };

  if (dismissed) return null;
  if (!deferredPrompt && !showIOSPrompt) return null;

  return (
    <div style={styles.banner} id="install-prompt-banner">
      <div style={styles.content}>
        <div style={styles.iconWrap}>
          <img src="/icon-192x192.png" alt="VPBS" style={styles.icon} />
        </div>
        <div style={styles.textWrap}>
          <div style={styles.title}>Cài đặt VPBS Demo</div>
          {deferredPrompt ? (
            <div style={styles.subtitle}>Thêm vào màn hình chính để trải nghiệm tốt hơn</div>
          ) : (
            <div style={styles.subtitle}>
              Nhấn <span style={styles.shareIcon}>⎋</span>{' '}
              rồi chọn <strong>&quot;Thêm vào MH chính&quot;</strong>
            </div>
          )}
        </div>
      </div>
      <div style={styles.actions}>
        {deferredPrompt && (
          <button style={styles.installBtn} onClick={handleInstall} id="install-btn">
            Cài đặt
          </button>
        )}
        <button style={styles.dismissBtn} onClick={dismiss} id="dismiss-install-btn">
          ✕
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  banner: {
    position: 'fixed',
    bottom: '8rem',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100% - 32px)',
    maxWidth: '468px',
    background: 'linear-gradient(135deg, #1e2636 0%, #1a1f2e 100%)',
    border: '1px solid rgba(14, 163, 105, 0.3)',
    borderRadius: '16px',
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 9999,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
    animation: 'slideUpInstall 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    minWidth: 0,
  },
  iconWrap: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    overflow: 'hidden',
    flexShrink: 0,
  },
  icon: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '2px',
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: '12px',
    lineHeight: '1.3',
  },
  shareIcon: {
    fontSize: '16px',
    verticalAlign: 'middle',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
    marginLeft: '8px',
  },
  installBtn: {
    background: '#0ea369',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  dismissBtn: {
    background: 'transparent',
    color: '#9ca3af',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px',
    lineHeight: 1,
  },
};
