"use client";
import { useState, useEffect, useRef } from "react";
import {
  EnvelopeSimple,
  EnvelopeOpen,
  PaperPlaneTilt,
  Trash,
  ArrowLeft,
  PencilSimple,
  X,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { getInboxEmails, getSentEmails, sendSingleEmail } from "@/app/api/email/actions";
import { searchUsers } from "@/app/api/users/actions";

import styles from "./EmailInbox.module.css";
import { useToast } from "@/context/ToastContext/ToastContext";

interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  preview: string;
  body: string;
  date: string;
  isRead: boolean;
  status: "sent" | "failed" | "bounced" | "opened" | "clicked";
}

interface UserSuggestion {
  email: string;
  name: string;
}

export default function EmailInbox() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"inbox" | "sent">("inbox");
  const { showToast } = useToast();

  useEffect(() => {
    fetchEmails();
  }, [filter]);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      let data;

      if (filter === "inbox") {
        data = await getInboxEmails(100);
      } else if (filter === "sent") {
        data = await getSentEmails(100);
      }

      const emailData: Email[] = data.map((email: any) => ({
        id: email.id,
        from: email.from?.emailAddress?.address || "Unknown",
        to: email.to?.[0]?.emailAddress?.address || "me",
        subject: email.subject,
        preview: email.bodyPreview,
        body: email.body?.content || "",
        date: new Date(email.receivedDateTime).toLocaleString(),
        isRead: email.isRead,
        status: email.status || "sent",
      }));

      setEmails(emailData);
    } catch (error) {
      console.error("Error fetching emails:", error);
      showToast("Failed to fetch emails", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (emailId: string) => {
    if (!confirm("Delete this email?")) return;

    try {
      setEmails(emails.filter((e) => e.id !== emailId));
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(null);
      }
      showToast("Email deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting email:", error);
      showToast("Failed to delete email", "error");
    }
  };

  const handleEmailClick = async (email: Email) => {
    setSelectedEmail(email);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      sent: "#10b981",
      failed: "#ef4444",
      bounced: "#f59e0b",
      opened: "#0ea5e9",
      clicked: "#8B5CF6",
    };
    return colors[status as keyof typeof colors] || "#64748b";
  };

  const filteredEmails = emails.filter(
    (email) =>
      email.subject.toLowerCase().includes(search.toLowerCase()) ||
      email.from.toLowerCase().includes(search.toLowerCase()) ||
      email.to.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {showCompose ? (
        <div className={styles.composeWrapper}>
          <ComposeEmail
            onClose={() => setShowCompose(false)}
            onSent={() => {
              setShowCompose(false);
              fetchEmails();
            }}
          />
        </div>
      ) : (
        <>
          <div className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <h2>Email</h2>
              <button className={styles.composeBtn} onClick={() => setShowCompose(true)}>
                <PencilSimple size={20} weight="fill" />
                Compose
              </button>
            </div>

            <div className={styles.searchBox}>
              <MagnifyingGlass size={20} weight="bold" />
              <input
                type="text"
                placeholder="Search emails..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch("")} className={styles.clearBtn}>
                  <X size={16} weight="bold" />
                </button>
              )}
            </div>

            <div className={styles.filters}>
              <button
                className={`${styles.filterBtn} ${filter === "inbox" ? styles.active : ""}`}
                onClick={() => setFilter("inbox")}
              >
                Inbox
              </button>
              <button
                className={`${styles.filterBtn} ${filter === "sent" ? styles.active : ""}`}
                onClick={() => setFilter("sent")}
              >
                Sent
              </button>
            </div>

            <div className={styles.emailList}>
              {loading ? (
                <div className={styles.loading}>Loading...</div>
              ) : filteredEmails.length === 0 ? (
                <div className={styles.empty}>
                  <EnvelopeSimple size={48} weight="duotone" />
                  <p>No emails found</p>
                </div>
              ) : (
                filteredEmails.map((email) => (
                  <div
                    key={email.id}
                    className={`${styles.emailItem} ${
                      selectedEmail?.id === email.id ? styles.selected : ""
                    } ${email.isRead ? styles.read : ""}`}
                    onClick={() => handleEmailClick(email)}
                  >
                    <div className={styles.emailIcon}>
                      {email.isRead ? (
                        <EnvelopeOpen size={24} weight="fill" />
                      ) : (
                        <EnvelopeSimple size={24} weight="fill" />
                      )}
                    </div>
                    <div className={styles.emailInfo}>
                      <div className={styles.emailHeader}>
                        <span className={styles.emailTo}>
                          {filter === "sent" ? email.to : email.from}
                        </span>
                        <span
                          className={styles.statusDot}
                          style={{
                            backgroundColor: getStatusColor(email.status),
                          }}
                          title={email.status}
                        />
                      </div>
                      <div className={styles.emailSubject}>{email.subject}</div>
                      <div className={styles.emailDate}>{email.date}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={styles.content}>
            {selectedEmail ? (
              <>
                <div className={styles.contentHeader}>
                  <button className={styles.backBtn} onClick={() => setSelectedEmail(null)}>
                    <ArrowLeft size={20} weight="bold" />
                    Back
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(selectedEmail.id)}
                  >
                    <Trash size={20} weight="fill" />
                    Delete
                  </button>
                </div>

                <div className={styles.emailDetail}>
                  <div className={styles.detailHeader}>
                    <h1>{selectedEmail.subject}</h1>
                    <div className={styles.detailMeta}>
                      <p>
                        <strong>From:</strong> {selectedEmail.from}
                      </p>
                      <p>
                        <strong>To:</strong> {selectedEmail.to}
                      </p>
                      <p>
                        <strong>Date:</strong> {selectedEmail.date}
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        <span
                          style={{
                            color: getStatusColor(selectedEmail.status),
                          }}
                        >
                          {selectedEmail.status.toUpperCase()}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div
                    className={styles.emailBody}
                    dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
                  />
                </div>
              </>
            ) : (
              <div className={styles.emptyContent}>
                <EnvelopeSimple size={96} weight="duotone" />
                <h3>Select an email to view</h3>
                <p>Choose an email from the list to see its details</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ComposeEmail({ onClose, onSent }: { onClose: () => void; onSent: () => void }) {
  const [formData, setFormData] = useState({
    to: "",
    subject: "",
    body: "",
  });
  const [sending, setSending] = useState(false);
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // Search users as user types
  useEffect(() => {
    const searchForUsers = async () => {
      if (formData.to.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const users = await searchUsers(formData.to, formData.to);
        setSuggestions(users.map((u: any) => ({ email: u.email, name: u.name })));
        setShowSuggestions(users.length > 0);
      } catch (error) {
        console.error("Error searching users:", error);
      }
    };

    const debounce = setTimeout(searchForUsers, 300);
    return () => clearTimeout(debounce);
  }, [formData.to]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[selectedSuggestionIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  // Select a suggestion
  const selectSuggestion = (user: UserSuggestion) => {
    setFormData({ ...formData, to: user.email });
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    inputRef.current?.focus();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      await sendSingleEmail({
        to: formData.to,
        subject: formData.subject,
        body: formData.body,
      });
      showToast("Email sent successfully!", "success");
      onSent();
    } catch (error) {
      console.error("Error sending email:", error);
      showToast("Failed to send email", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.compose}>
      <div className={styles.composeHeader}>
        <h2>
          <PencilSimple size={24} weight="fill" />
          Compose Email
        </h2>
        <button onClick={onClose} className={styles.closeBtn}>
          <X size={24} weight="bold" />
        </button>
      </div>

      <form onSubmit={handleSend} className={styles.composeForm}>
        <div className={styles.formGroup} style={{ position: "relative" }}>
          <label>To:</label>
          <input
            ref={inputRef}
            type="email"
            value={formData.to}
            onChange={(e) => setFormData({ ...formData, to: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="recipient@example.com"
            required
            autoComplete="off"
          />

          {/* User Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div ref={suggestionRef} className={styles.suggestions}>
              {suggestions.map((user, index) => (
                <div
                  key={user.email}
                  className={`${styles.suggestionItem} ${
                    index === selectedSuggestionIndex ? styles.suggestionActive : ""
                  }`}
                  onClick={() => selectSuggestion(user)}
                  onMouseEnter={() => setSelectedSuggestionIndex(index)}
                >
                  <div className={styles.suggestionName}>{user.name}</div>
                  <div className={styles.suggestionEmail}>{user.email}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Subject:</label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Email subject"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Message:</label>
          <textarea
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            placeholder="Write your message here..."
            required
          />
        </div>

        <div className={styles.composeActions}>
          <button type="button" onClick={onClose} className={styles.cancelBtn}>
            Cancel
          </button>
          <button type="submit" className={styles.sendBtn} disabled={sending}>
            <PaperPlaneTilt size={20} weight="fill" />
            {sending ? "Sending..." : "Send Email"}
          </button>
        </div>
      </form>
    </div>
  );
}
