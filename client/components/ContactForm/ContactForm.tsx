"use client";

import { useState } from "react";
import { EnvelopeSimple, LinkedinLogo, GithubLogo, PaperPlaneTilt } from "@phosphor-icons/react";
import styles from "./ContactForm.module.css";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create mailto link with form data
    const subject = encodeURIComponent(`Contact from ${formData.name}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );

    window.location.href = `mailto:info.preguntame@gmail.com?subject=${subject}&body=${body}`;

    setStatus("success");
    setTimeout(() => {
      setFormData({ name: "", email: "", message: "" });
      setStatus("idle");
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className={styles.contactContainer}>
      {/* Breadcrumb Navigation */}

      {/* Contact Info Cards */}
      <div className={styles.contactGrid}>
        {/* Email Card */}
        <a
          href="mailto:info.preguntame@gmail.com"
          className={styles.contactCard}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className={styles.cardIcon}>
            <EnvelopeSimple size={32} weight="fill" />
          </div>
          <h3 className={styles.cardTitle}>Email Us</h3>
          <p className={styles.cardText}>info.preguntame@gmail.com</p>
        </a>

        {/* LinkedIn Card */}
        <a
          href="https://linkedin.com/in/kouroshmohajeri"
          className={styles.contactCard}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className={styles.cardIcon}>
            <LinkedinLogo size={32} weight="fill" />
          </div>
          <h3 className={styles.cardTitle}>LinkedIn</h3>
          <p className={styles.cardText}>@kouroshmohajeri</p>
        </a>

        {/* GitHub Card */}
        <a
          href="https://github.com/kouroshmohajeri"
          className={styles.contactCard}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className={styles.cardIcon}>
            <GithubLogo size={32} weight="fill" />
          </div>
          <h3 className={styles.cardTitle}>GitHub</h3>
          <p className={styles.cardText}>@kouroshmohajeri</p>
        </a>
      </div>

      {/* Contact Form */}
      <div className={styles.formSection}>
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>Send Us a Message</h2>
          <p className={styles.formSubtitle}>
            Have a question or feedback? We'd love to hear from you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Your Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="John Doe"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Your Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="john@example.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="message" className={styles.label}>
              Your Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              className={styles.textarea}
              placeholder="Tell us what's on your mind..."
              rows={6}
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            <PaperPlaneTilt size={20} weight="fill" />
            <span>Send Message</span>
          </button>

          {status === "success" && (
            <div className={styles.successMessage}>
              Message sent successfully! We'll get back to you soon.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
