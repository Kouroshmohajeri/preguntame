// components/AIQuestionWizard/components/WizardProgressBar.tsx
import styles from "../AIQuestionWizard.module.css";
import { WizardStep } from "../types";

interface WizardProgressBarProps {
  currentStep: WizardStep;
}

const STEPS = [
  { number: 1, label: "Title" },
  { number: 2, label: "Input" },
  { number: 3, label: "Configure" },
  { number: 4, label: "Review" },
];

export default function WizardProgressBar({ currentStep }: WizardProgressBarProps) {
  return (
    <div className={styles.progressBar}>
      {STEPS.map((step, index) => (
        <>
          <div
            key={step.number}
            className={`${styles.progressStep} ${currentStep >= step.number ? styles.active : ""}`}
          >
            <div className={styles.stepNumber}>{step.number}</div>
            <span>{step.label}</span>
          </div>
          {index < STEPS.length - 1 && (
            <div key={`line-${index}`} className={styles.progressLine} />
          )}
        </>
      ))}
    </div>
  );
}
