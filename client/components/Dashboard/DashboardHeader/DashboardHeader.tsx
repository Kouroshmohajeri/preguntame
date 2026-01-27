"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { UserData } from "../type";
import styles from "./DashboardHeader.module.css";

interface Props {
  userData: UserData | null;
}

export default function DashboardHeader({ userData }: Props) {
  const router = useRouter();

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logoSection}>
          <Image
            src="/images/logo.png"
            alt="Pregúntame Logo"
            width={60}
            height={60}
            className={styles.logo}
          />
          <div className={styles.titleSection}>
            <h1 className={styles.title}>DASHBOARD</h1>
            <p className={styles.subtitle}>Player Control Panel</p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button onClick={() => router.push("/create")} className={styles.createButton}>
            + CREATE NEW
          </button>
          <div className={styles.userInfo}>
            {userData && (
              <div className={styles.avatarContainer}>
                <Image
                  src={userData.avatar}
                  alt="User Avatar"
                  width={55}
                  height={55}
                  className={styles.avatar}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
