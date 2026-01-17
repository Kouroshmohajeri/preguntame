"use client";
import { Lock } from "@phosphor-icons/react";
import styles from "./AuthBox.module.css";

interface AuthBoxProps {
  token: string;
  setToken: (token: string) => void;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AuthBox({ token, setToken, error, loading, onSubmit }: AuthBoxProps) {
  return (
    <div className={styles.container}>
      <div className={styles.authBox}>
        <div className={styles.lockIconWrapper}>
          <Lock size={64} weight="fill" className={styles.lockIcon} />
        </div>
        <h1 className={styles.title}>Analytics Access</h1>
        <p className={styles.subtitle}>Enter your Google Authenticator code</p>

        <form onSubmit={onSubmit} className={styles.form}>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            className={styles.input}
            maxLength={6}
            autoFocus
          />

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            disabled={loading || token.length !== 6}
            className={styles.submitButton}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>
      </div>
    </div>
  );
}
