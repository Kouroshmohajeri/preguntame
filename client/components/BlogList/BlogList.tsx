"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Article,
  Question,
  Calendar,
  Clock,
  ArrowRight,
  MagnifyingGlass,
  Sparkle,
  Lightning,
} from "@phosphor-icons/react";
import styles from "./BlogList.module.css";

// Blog post type
interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  icon: React.ReactNode;
}

// Blog posts
const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "what-is-preguntame",
    title: "What is Preguntame? The Ultimate Free Real-Time Quiz Platform",
    excerpt:
      "Discover how Preguntame revolutionizes interactive learning with free real-time multiplayer quizzes. Perfect for classrooms, events, and team building activities.",
    category: "About",
    date: "2024-12-20",
    readTime: "8 min read",
    icon: <Question size={32} weight="fill" />,
  },
  {
    id: "2",
    slug: "kahoot-alternative",
    title: "The Best Free Kahoot Alternative: Why Preguntame Stands Out",
    excerpt:
      "Looking for a Kahoot alternative? Discover why Preguntame offers a completely free, feature-rich experience for interactive quizzes without subscription limits.",
    category: "Comparisons",
    date: "2025-01-06",
    readTime: "10 min read",
    icon: <Sparkle size={32} weight="fill" />,
  },
  {
    id: "3",
    slug: "real-time-quiz-platform",
    title: "Real-Time Quiz Platform: How Preguntame Powers Interactive Learning",
    excerpt:
      "Explore how Preguntame's real-time technology creates engaging, synchronous quiz experiences for classrooms, training sessions, and live events.",
    category: "Features",
    date: "2025-01-06",
    readTime: "9 min read",
    icon: <Lightning size={32} weight="fill" />,
  },
];

const categories = ["All", "About", "Comparisons", "Features"];

export default function BlogList() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Filter posts
  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={styles.mainContainer}>
      <div className={styles.contentWrapper}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <a href="/" className={styles.breadcrumbLink}>
            Home
          </a>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>Blog</span>
        </nav>

        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroIcon}>
            <Article size={64} weight="fill" />
          </div>
          <h1 className={styles.mainTitle}>Blog</h1>
          <p className={styles.subtitle}>
            Tips, strategies, and insights for creating engaging quizzes and interactive learning
            experiences.
          </p>

          {/* Pixel Separator */}
          <div className={styles.pixelSeparator}>
            {[...Array(15)].map((_, i) => (
              <div key={i} className={styles.pixel} style={{ "--i": i } as React.CSSProperties} />
            ))}
          </div>
        </section>

        {/* Search and Filter */}
        <section className={styles.filterSection}>
          <div className={styles.searchBox}>
            <MagnifyingGlass size={20} weight="bold" className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.categoryFilter}>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`${styles.categoryButton} ${
                  selectedCategory === category ? styles.active : ""
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className={styles.postsSection}>
          {filteredPosts.length > 0 ? (
            <div className={styles.postsGrid}>
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className={styles.postCard}
                  onClick={() => router.push(`/${post.slug}`)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === "Enter" && router.push(`/${post.slug}`)}
                >
                  <div className={styles.postIcon}>{post.icon}</div>

                  <div className={styles.postMeta}>
                    <span className={styles.postCategory}>{post.category}</span>
                    <div className={styles.postMetaInfo}>
                      <span className={styles.postDate}>
                        <Calendar size={14} weight="fill" />
                        {new Date(post.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className={styles.postReadTime}>
                        <Clock size={14} weight="fill" />
                        {post.readTime}
                      </span>
                    </div>
                  </div>

                  <h2 className={styles.postTitle}>{post.title}</h2>
                  <p className={styles.postExcerpt}>{post.excerpt}</p>

                  <div className={styles.postFooter}>
                    <span className={styles.readMore}>
                      Read More
                      <ArrowRight size={16} weight="bold" />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.noResults}>
              <Article size={48} weight="fill" />
              <h3>No articles found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaBox}>
            <h2>Ready to Create Your Own Quiz?</h2>
            <p>Start building engaging quizzes for your classroom, event, or team today.</p>
            <button onClick={() => router.push("/create")} className={styles.ctaButton}>
              Create Free Quiz
              <ArrowRight size={20} weight="bold" />
            </button>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.poweredBy}>Designed & Powered by WebGallery</p>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} Pregúntame. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
