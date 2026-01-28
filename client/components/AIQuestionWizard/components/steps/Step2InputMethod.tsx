import {
  ChatText,
  FileText,
  Globe,
  YoutubeLogo,
  ArrowRight,
  ArrowLeft,
} from "@phosphor-icons/react";
import styles from "../../AIQuestionWizard.module.css";
import { InputMethod } from "../../types";

interface Step2InputMethodProps {
  inputMethod: InputMethod;
  setInputMethod: (method: InputMethod) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  url: string;
  setUrl: (url: string) => void;
  file: File | null;
  setFile: (file: File | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2InputMethod({
  inputMethod,
  setInputMethod,
  prompt,
  setPrompt,
  url,
  setUrl,
  file,
  setFile,
  onNext,
  onBack,
}: Step2InputMethodProps) {
  return (
    <div className={styles.step}>
      <h2 className={styles.stepTitle}>Choose your input method</h2>
      <div className={styles.inputMethods}>
        <button
          className={`${styles.methodBtn} ${inputMethod === "prompt" ? styles.selected : ""}`}
          onClick={() => setInputMethod("prompt")}
        >
          <ChatText size={40} weight="duotone" />
          <span>Text/Prompt</span>
        </button>
        <button
          className={`${styles.methodBtn} ${inputMethod === "file" ? styles.selected : ""}`}
          onClick={() => setInputMethod("file")}
        >
          <FileText size={40} weight="duotone" />
          <span>Upload File</span>
        </button>
        <button
          className={`${styles.methodBtn} ${inputMethod === "url" ? styles.selected : ""}`}
          onClick={() => setInputMethod("url")}
        >
          <Globe size={40} weight="duotone" />
          <span>Website URL</span>
        </button>
        <button
          className={`${styles.methodBtn} ${inputMethod === "youtube" ? styles.selected : ""}`}
          onClick={() => setInputMethod("youtube")}
        >
          <YoutubeLogo size={40} weight="duotone" />
          <span>YouTube Video</span>
        </button>
      </div>

      {inputMethod === "prompt" && (
        <div className={styles.inputArea}>
          <label>Enter a topic or paste your content</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., World War II, Python programming basics, or paste your study material..."
            rows={8}
            className={styles.textarea}
          />
        </div>
      )}

      {inputMethod === "file" && (
        <div className={styles.inputArea}>
          <label>Upload a file (PDF, DOCX, TXT)</label>
          <input
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className={styles.fileInput}
          />
          {file && <p className={styles.fileName}>Selected: {file.name}</p>}
        </div>
      )}

      {(inputMethod === "url" || inputMethod === "youtube") && (
        <div className={styles.inputArea}>
          <label>{inputMethod === "youtube" ? "YouTube video URL" : "Website URL"}</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={
              inputMethod === "youtube"
                ? "https://youtube.com/watch?v=..."
                : "https://example.com/article"
            }
            className={styles.textInput}
          />
        </div>
      )}

      <div className={styles.buttonGroup}>
        <button onClick={onBack} className={styles.btnSecondary}>
          <ArrowLeft size={20} weight="bold" />
          Back
        </button>
        <button onClick={onNext} className={styles.btnPrimary}>
          Next Step
          <ArrowRight size={20} weight="bold" />
        </button>
      </div>
    </div>
  );
}
