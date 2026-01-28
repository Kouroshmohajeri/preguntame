import { ArrowLeft, MagicWand } from "@phosphor-icons/react";
import styles from "../AIQuestionWizard.module.css";

interface WizardHeaderProps {
  onClose: () => void;
}

export default function WizardHeader({ onClose }: WizardHeaderProps) {
  return (
    <div className={styles.header}>
      <button onClick={onClose} className={styles.backBtn}>
        <ArrowLeft size={20} weight="bold" />
      </button>
      <h1 className={styles.title}>
        <MagicWand size={28} weight="fill" className={styles.titleIcon} />
        AI Question Generator
      </h1>
      <div></div>
    </div>
  );
}
