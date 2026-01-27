"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Crown,
  Rocket,
  CheckCircle,
  Lightning,
  Users,
  Star,
  ArrowRight,
  X,
  Globe,
} from "@phosphor-icons/react";

import styles from "./SubscriptionGateway.module.css";
import { createCheckoutSession } from "../api/subscribe/actions";

type Plan = "starter" | "pro";
type BillingCycle = "monthly" | "yearly";
type Currency = "EUR" | "USD";
type Locale = "en" | "es" | "fr";

const SubscriptionGateway = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<Plan>("pro");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [locale, setLocale] = useState<Locale>("en");
  const [loading, setLoading] = useState(false);

  // Detect user's location and set currency/locale
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const browserLang = navigator.language.toLowerCase();

        if (browserLang.startsWith("es")) {
          setLocale("es");
          setCurrency("EUR");
        } else if (browserLang.startsWith("fr")) {
          setLocale("fr");
          setCurrency("EUR");
        } else if (browserLang.startsWith("en-us")) {
          setLocale("en");
          setCurrency("USD");
        } else {
          setLocale("en");
          setCurrency("EUR");
        }
      } catch (error) {
        console.error("Error detecting location:", error);
        setLocale("en");
        setCurrency("EUR");
      }
    };

    detectLocation();
  }, []);

  // Translations (keep existing translations object)
  const translations = {
    en: {
      title: "LEVEL UP YOUR GAME",
      subtitle: "Choose your plan and unlock premium features",
      monthly: "MONTHLY",
      yearly: "YEARLY",
      save: "SAVE",
      mostPopular: "MOST POPULAR",
      selected: "SELECTED",
      startPlan: "START",
      plan: "PLAN",
      processing: "REDIRECTING TO CHECKOUT...",
      trial: "7-day free trial",
      trialPro: "14-day free trial on yearly",
      cancelAnytime: "Cancel anytime",
      instantAccess: "INSTANT ACCESS",
      noCommitment: "NO COMMITMENT",
      premiumSupport: "PREMIUM SUPPORT",
      starterFeatures: [
        "30 AI generated quizzes/month",
        "Prompt & URL generation",
        "English/Spanish/French support",
        "25 questions max per game",
        "7-day free access",
      ],
      proFeatures: [
        "100 AI generated questions/month",
        "All access (Prompt, URL, File, YouTube)",
        "Every language supported",
        "True/False answer format",
        "14-day extra on yearly plan",
      ],
    },
    es: {
      title: "MEJORA TU JUEGO",
      subtitle: "Elige tu plan y desbloquea funciones premium",
      monthly: "MENSUAL",
      yearly: "ANUAL",
      save: "AHORRA",
      mostPopular: "MÁS POPULAR",
      selected: "SELECCIONADO",
      startPlan: "COMENZAR",
      plan: "PLAN",
      processing: "REDIRIGIENDO AL PAGO...",
      trial: "7 días gratis",
      trialPro: "14 días gratis en plan anual",
      cancelAnytime: "Cancela cuando quieras",
      instantAccess: "ACCESO INSTANTÁNEO",
      noCommitment: "SIN COMPROMISO",
      premiumSupport: "SOPORTE PREMIUM",
      starterFeatures: [
        "30 cuestionarios IA/mes",
        "Generación por prompt y URL",
        "Soporte inglés/español/francés",
        "25 preguntas máx. por juego",
        "7 días de acceso gratis",
      ],
      proFeatures: [
        "100 preguntas IA/mes",
        "Acceso completo (Prompt, URL, Archivo, YouTube)",
        "Todos los idiomas soportados",
        "Formato verdadero/falso",
        "14 días extra en plan anual",
      ],
    },
    fr: {
      title: "AMÉLIOREZ VOTRE JEU",
      subtitle: "Choisissez votre plan et débloquez les fonctionnalités premium",
      monthly: "MENSUEL",
      yearly: "ANNUEL",
      save: "ÉCONOMISEZ",
      mostPopular: "LE PLUS POPULAIRE",
      selected: "SÉLECTIONNÉ",
      startPlan: "COMMENCER",
      plan: "PLAN",
      processing: "REDIRECTION VERS LE PAIEMENT...",
      trial: "7 jours gratuits",
      trialPro: "14 jours gratuits sur plan annuel",
      cancelAnytime: "Annulez à tout moment",
      instantAccess: "ACCÈS INSTANTANÉ",
      noCommitment: "SANS ENGAGEMENT",
      premiumSupport: "SUPPORT PREMIUM",
      starterFeatures: [
        "30 quiz IA/mois",
        "Génération par prompt et URL",
        "Support anglais/espagnol/français",
        "25 questions max par jeu",
        "7 jours d'accès gratuit",
      ],
      proFeatures: [
        "100 questions IA/mois",
        "Accès complet (Prompt, URL, Fichier, YouTube)",
        "Toutes les langues supportées",
        "Format vrai/faux",
        "14 jours supplémentaires sur plan annuel",
      ],
    },
  };

  const t = translations[locale];

  type PlanDetails = {
    name: string;
    icon: any;
    color: string;
    popular?: boolean;
    prices: {
      EUR: { monthly: number; yearly: number };
      USD: { monthly: number; yearly: number };
    };
    features: string[];
  };

  const plans: Record<Plan, PlanDetails> = {
    starter: {
      name: "STARTER",
      icon: Rocket,
      color: "#4ECDC4",
      prices: {
        EUR: { monthly: 7.99, yearly: 79.99 },
        USD: { monthly: 9.99, yearly: 94.99 },
      },
      features: t.starterFeatures,
    },
    pro: {
      name: "PRO",
      icon: Crown,
      color: "#FFD166",
      popular: true,
      prices: {
        EUR: { monthly: 14.99, yearly: 149.99 },
        USD: { monthly: 17.99, yearly: 174.99 },
      },
      features: t.proFeatures,
    },
  };

  const currentPlan = plans[selectedPlan];
  const price =
    billingCycle === "monthly"
      ? currentPlan.prices[currency].monthly
      : currentPlan.prices[currency].yearly;

  const monthlyPrice = currentPlan.prices[currency].monthly;
  const yearlyPrice = currentPlan.prices[currency].yearly;
  const savings =
    billingCycle === "yearly"
      ? Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100)
      : 0;

  const currencySymbol = currency === "EUR" ? "€" : "$";
  const trialText = selectedPlan === "pro" && billingCycle === "yearly" ? t.trialPro : t.trial;

  const handleSubscribe = async () => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    setLoading(true);
    try {
      // Create checkout session and redirect to Stripe
      const { url } = await createCheckoutSession(selectedPlan, billingCycle);

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error("Subscription error:", error);
      alert("Failed to create checkout session. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logoSection}>
          <Image
            src="/images/logo.png"
            alt="Pregúntame"
            width={50}
            height={50}
            className={styles.logo}
          />
          <h1 className={styles.title}>PREGÚNTAME</h1>
        </div>

        <div className={styles.headerActions}>
          {/* Language Selector */}
          <div className={styles.languageSelector}>
            <Globe size={20} />
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              className={styles.localeSelect}
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
              <option value="fr">FR</option>
            </select>
          </div>

          {/* Currency Selector */}
          <div className={styles.currencySelector}>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className={styles.currencySelect}
            >
              <option value="EUR">€ EUR</option>
              <option value="USD">$ USD</option>
            </select>
          </div>

          <button onClick={() => router.push("/dashboard")} className={styles.backButton}>
            <X size={20} /> {locale === "es" ? "VOLVER" : locale === "fr" ? "RETOUR" : "BACK"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.hero}>
          <Lightning size={48} className={styles.heroIcon} weight="fill" />
          <h1 className={styles.heroTitle}>{t.title}</h1>
          <p className={styles.heroSubtitle}>{t.subtitle}</p>
        </div>

        {/* Billing Toggle */}
        <div className={styles.billingToggle}>
          <button
            className={`${styles.toggleButton} ${billingCycle === "monthly" ? styles.active : ""}`}
            onClick={() => setBillingCycle("monthly")}
          >
            {t.monthly}
          </button>
          <button
            className={`${styles.toggleButton} ${billingCycle === "yearly" ? styles.active : ""}`}
            onClick={() => setBillingCycle("yearly")}
          >
            {t.yearly}
            {billingCycle === "yearly" && (
              <span className={styles.savingsBadge}>
                {t.save} {savings}%
              </span>
            )}
          </button>
        </div>

        {/* Plan Cards */}
        <div className={styles.plansGrid}>
          {(Object.keys(plans) as Plan[]).map((planKey) => {
            const plan = plans[planKey];
            const Icon = plan.icon;
            const planPrice =
              billingCycle === "monthly"
                ? plan.prices[currency].monthly
                : plan.prices[currency].yearly;

            return (
              <div
                key={planKey}
                className={`${styles.planCard} ${selectedPlan === planKey ? styles.selected : ""}`}
                onClick={() => setSelectedPlan(planKey)}
              >
                {plan.popular && (
                  <div className={styles.popularBadge}>
                    <Star size={16} weight="fill" /> {t.mostPopular}
                  </div>
                )}

                <div className={styles.planHeader}>
                  <div className={styles.planIcon} style={{ background: plan.color }}>
                    <Icon size={32} weight="fill" />
                  </div>
                  <h3 className={styles.planName}>{plan.name}</h3>
                </div>

                <div className={styles.planPrice}>
                  <span className={styles.currency}>{currencySymbol}</span>
                  <span className={styles.amount}>{planPrice.toFixed(2)}</span>
                  <span className={styles.period}>/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                </div>

                <ul className={styles.featuresList}>
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className={styles.feature}>
                      <CheckCircle size={20} weight="fill" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {selectedPlan === planKey && (
                  <div className={styles.selectedIndicator}>
                    <CheckCircle size={24} weight="fill" /> {t.selected}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Subscribe Button */}
        <div className={styles.ctaSection}>
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className={styles.subscribeButton}
            style={{ borderColor: currentPlan.color }}
          >
            {loading ? (
              t.processing
            ) : (
              <>
                {t.startPlan} {currentPlan.name} {t.plan}
                <ArrowRight size={20} weight="bold" />
              </>
            )}
          </button>
          <p className={styles.trialNote}>
            <Users size={16} /> {trialText} • {t.cancelAnytime}
          </p>
        </div>

        {/* Trust Badges */}
        <div className={styles.trustBadges}>
          <div className={styles.badge}>
            <Lightning size={20} weight="fill" />
            <span>{t.instantAccess}</span>
          </div>
          <div className={styles.badge}>
            <CheckCircle size={20} weight="fill" />
            <span>{t.noCommitment}</span>
          </div>
          <div className={styles.badge}>
            <Star size={20} weight="fill" />
            <span>{t.premiumSupport}</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubscriptionGateway;
