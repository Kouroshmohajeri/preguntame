"use client";
import { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Pencil,
  Trash,
  Eye,
  Copy,
  MagnifyingGlass,
  X,
  Code,
} from "@phosphor-icons/react";
import {
  getEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
} from "../../../api/email/actions";
import { EmailTemplate } from "../../types/email.types";
import styles from "./TemplateManager.module.css";

export default function TemplateManager() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await getEmailTemplates();
      setTemplates(data);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      await deleteEmailTemplate(id);
      setTemplates(templates.filter((t) => t._id !== id));
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const handleDuplicate = async (template: EmailTemplate) => {
    try {
      const newTemplate = await createEmailTemplate({
        name: `${template.name} (Copy)`,
        description: template.description,
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent,
        category: template.category,
        variables: template.variables,
      });
      setTemplates([newTemplate, ...templates]);
    } catch (error) {
      console.error("Error duplicating template:", error);
    }
  };

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.subject.toLowerCase().includes(search.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    const colors = {
      marketing: "#8B5CF6",
      transactional: "#0ea5e9",
      notification: "#10b981",
      announcement: "#f59e0b",
    };
    return colors[category as keyof typeof colors] || "#64748b";
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.searchContainer}>
          <MagnifyingGlass size={20} weight="bold" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          {search && (
            <button onClick={() => setSearch("")} className={styles.clearBtn}>
              <X size={16} weight="bold" />
            </button>
          )}
        </div>
        <button className={styles.createBtn} onClick={() => setShowCreateModal(true)}>
          <Plus size={20} weight="bold" />
          Create Template
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading templates...</div>
      ) : filteredTemplates.length === 0 ? (
        <div className={styles.empty}>
          <FileText size={64} weight="duotone" />
          <h3>No templates found</h3>
          <p>Create your first email template to get started</p>
        </div>
      ) : (
        <div className={styles.templateGrid}>
          {filteredTemplates.map((template) => (
            <div key={template._id} className={styles.templateCard}>
              <div className={styles.cardHeader}>
                <span
                  className={styles.categoryBadge}
                  style={{ backgroundColor: getCategoryColor(template.category) }}
                >
                  {template.category}
                </span>
                <div className={styles.cardActions}>
                  <button
                    className={styles.actionBtn}
                    onClick={() => setPreviewTemplate(template)}
                    title="Preview"
                  >
                    <Eye size={18} weight="fill" />
                  </button>
                  <button
                    className={styles.actionBtn}
                    onClick={() => setSelectedTemplate(template)}
                    title="Edit"
                  >
                    <Pencil size={18} weight="fill" />
                  </button>
                  <button
                    className={styles.actionBtn}
                    onClick={() => handleDuplicate(template)}
                    title="Duplicate"
                  >
                    <Copy size={18} weight="fill" />
                  </button>
                  <button
                    className={styles.actionBtn}
                    onClick={() => handleDelete(template._id)}
                    title="Delete"
                  >
                    <Trash size={18} weight="fill" />
                  </button>
                </div>
              </div>

              <h3 className={styles.templateName}>{template.name}</h3>
              <p className={styles.templateSubject}>{template.subject}</p>
              {template.description && (
                <p className={styles.templateDesc}>{template.description}</p>
              )}

              <div className={styles.cardFooter}>
                <div className={styles.usageCount}>
                  <FileText size={16} weight="fill" />
                  Used {template.usageCount} times
                </div>
                {template.variables.length > 0 && (
                  <div className={styles.variables}>
                    <Code size={16} weight="fill" />
                    {template.variables.length} variables
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <TemplateEditorModal
          onClose={() => setShowCreateModal(false)}
          onSave={(template) => {
            setTemplates([template, ...templates]);
            setShowCreateModal(false);
          }}
        />
      )}

      {selectedTemplate && (
        <TemplateEditorModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onSave={(template) => {
            setTemplates(templates.map((t) => (t._id === template._id ? template : t)));
            setSelectedTemplate(null);
          }}
        />
      )}

      {previewTemplate && (
        <TemplatePreviewModal template={previewTemplate} onClose={() => setPreviewTemplate(null)} />
      )}
    </div>
  );
}

// Template Editor Modal Component
function TemplateEditorModal({
  template,
  onClose,
  onSave,
}: {
  template?: EmailTemplate;
  onClose: () => void;
  onSave: (template: EmailTemplate) => void;
}) {
  const [formData, setFormData] = useState({
    name: template?.name || "",
    description: template?.description || "",
    subject: template?.subject || "",
    htmlContent: template?.htmlContent || "",
    textContent: template?.textContent || "",
    category: template?.category || "marketing",
    variables: template?.variables.join(", ") || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const templateData = {
        name: formData.name,
        description: formData.description,
        subject: formData.subject,
        htmlContent: formData.htmlContent,
        textContent: formData.textContent,
        category: formData.category as any,
        variables: formData.variables
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
      };

      let savedTemplate;
      if (template) {
        savedTemplate = await updateEmailTemplate(template._id, templateData);
      } else {
        savedTemplate = await createEmailTemplate(templateData);
      }

      onSave(savedTemplate);
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.editorModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{template ? "Edit Template" : "Create Template"}</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={24} weight="bold" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.editorForm}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Template Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Welcome Email"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Category *</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as
                      | "marketing"
                      | "transactional"
                      | "notification"
                      | "announcement",
                  })
                }
                required
              >
                <option value="marketing">Marketing</option>
                <option value="transactional">Transactional</option>
                <option value="notification">Notification</option>
                <option value="announcement">Announcement</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this template"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Subject Line *</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
              placeholder="e.g., Welcome to {{name}}!"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Variables (comma-separated)</label>
            <input
              type="text"
              value={formData.variables}
              onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
              placeholder="e.g., name, email, companyName"
            />
            <small>Use {`{{variableName}}`} in your content</small>
          </div>

          <div className={styles.formGroup}>
            <label>HTML Content *</label>
            <textarea
              value={formData.htmlContent}
              onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
              required
              rows={12}
              placeholder="<html>...</html>"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Plain Text Content</label>
            <textarea
              value={formData.textContent}
              onChange={(e) => setFormData({ ...formData, textContent: e.target.value })}
              rows={6}
              placeholder="Plain text version for email clients that don't support HTML"
            />
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? "Saving..." : template ? "Update Template" : "Create Template"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Template Preview Modal
function TemplatePreviewModal({
  template,
  onClose,
}: {
  template: EmailTemplate;
  onClose: () => void;
}) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.previewModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Preview: {template.name}</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={24} weight="bold" />
          </button>
        </div>

        <div className={styles.previewContent}>
          <div className={styles.previewMeta}>
            <p>
              <strong>Subject:</strong> {template.subject}
            </p>
            {template.description && (
              <p>
                <strong>Description:</strong> {template.description}
              </p>
            )}
          </div>

          <div className={styles.previewIframe}>
            <iframe
              srcDoc={template.htmlContent}
              title="Email Preview"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
