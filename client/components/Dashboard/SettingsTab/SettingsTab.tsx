"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { UserData } from "../type";
import { Envelope, Clock, SignOut, Shield } from "@phosphor-icons/react";
import { updateUserSettings } from "@/app/api/users/actions";
import { useToast } from "@/context/ToastContext/ToastContext";
import styles from "./SettingsTab.module.css";

interface Props {
  userData: UserData;
}

export default function SettingsTab({ userData }: Props) {
  const { showToast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(userData.emailNotifications ?? true);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleEmailNotifications = async () => {
    setIsSaving(true);
    try {
      const newValue = !emailNotifications;
      await updateUserSettings(userData._id, { emailNotifications: newValue });
      setEmailNotifications(newValue);
      showToast(`Email notifications ${newValue ? "enabled" : "disabled"}!`, "success");
    } catch (error) {
      console.error("Error updating email notifications:", error);
      showToast("Failed to update settings", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    localStorage.removeItem("playerUUID");
    showToast("Logging out...", "info");
    await signOut({ callbackUrl: "/", redirect: true });
    showToast("Successfully logged out!", "success");
  };

  return (
    <div className={styles.settingsSection}>
      <div className={styles.settingsHeader}>
        <h2 className={styles.settingsTitle}>PROFILE SETTINGS</h2>
      </div>

      <div className={styles.settingsGrid}>
        {/* Profile Card */}
        <div className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <div className={styles.avatarLargeContainer}>
              <Image
                src={userData.avatar}
                alt="User Avatar"
                width={120}
                height={120}
                className={styles.avatarLarge}
              />
            </div>
            <div className={styles.profileInfo}>
              <h3 className={styles.profileName}>
                {userData.name} {userData.lastname}
              </h3>
              <div className={styles.profileDetail}>
                <Envelope size={18} />
                <span>{userData.email}</span>
              </div>
              <div className={styles.profileDetail}>
                <Clock size={18} />
                <span>Member since {new Date(userData.createdAt).toLocaleDateString()}</span>
              </div>

              {/* Logout Button */}
              <button onClick={handleSignOut} className={styles.logoutButton}>
                <SignOut size={18} />
                LOGOUT
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Card */}
        <div className={styles.privacyCard}>
          <h3 className={styles.privacyTitle}>
            <Shield size={24} />
            PRIVACY SETTINGS
          </h3>
          <div className={styles.privacyOptions}>
            <div className={styles.privacyOption}>
              <div className={styles.optionInfo}>
                <h4>Email Notifications</h4>
                <p>Receive updates and announcements</p>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={handleToggleEmailNotifications}
                  disabled={isSaving}
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
