import { GameController, ArrowRight } from "@phosphor-icons/react";
import styles from "../../AIQuestionWizard.module.css";

interface Step1GameTitleProps {
  gameTitle: string;
  setGameTitle: (title: string) => void;
  onNext: () => void;
}

export default function Step1GameTitle({ gameTitle, setGameTitle, onNext }: Step1GameTitleProps) {
  return (
    <div className={styles.step}>
      <div className={styles.titleHero}>
        <GameController size={80} weight="duotone" className={styles.heroIcon} />
        <h2 className={styles.stepTitle}>Let's start with a title</h2>
        <p className={styles.subtitle}>Give your quiz game a memorable name</p>
      </div>

      <div className={styles.titleSection}>
        <input
          type="text"
          value={gameTitle}
          onChange={(e) => setGameTitle(e.target.value)}
          placeholder="e.g., World War II Quiz, Python Basics Test, General Knowledge..."
          className={styles.titleInputLarge}
          autoFocus
        />
      </div>

      <div className={styles.buttonGroup}>
        <button onClick={onNext} className={styles.btnPrimary} disabled={!gameTitle.trim()}>
          Continue
          <ArrowRight size={20} weight="bold" />
        </button>
      </div>
    </div>
  );
}
