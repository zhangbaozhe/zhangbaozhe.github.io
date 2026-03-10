<script setup lang="ts">
import { computed } from "vue";
import publicationsData from "../data/publications";

type Publication = {
  category?: string;
  title: string;
  authors: string[];
  venue: string;
  link?: string;
  github?: string;
  image?: string;
  year?: number;
  excerpt?: string;
};

const publications = [...(publicationsData as Publication[])].sort(
  (left, right) => (right.year || 0) - (left.year || 0)
);

const groupedPublications = computed(() => {
  const groups = new Map<string, Publication[]>();

  publications.forEach((publication) => {
    const category = publication.category || "Uncategorized";
    const entries = groups.get(category);
    if (entries) {
      entries.push(publication);
    } else {
      groups.set(category, [publication]);
    }
  });

  return Array.from(groups.entries()).sort(([left], [right]) =>
    left.localeCompare(right)
  );
});
</script>

<template>
  <div class="publications">
    <section
      v-for="[category, publicationsInCategory] in groupedPublications"
      :key="category"
      class="publication-category-group"
    >
      <h3 class="category-heading">{{ category }}</h3>
      <article
        v-for="(publication, index) in publicationsInCategory"
        :key="publication.link || index"
        class="publication-item"
      >
        <div v-if="publication.image" class="publication-media">
          <img
            :src="publication.image"
            :alt="publication.title"
            class="publication-image"
            loading="lazy"
          />
        </div>
        <div class="publication-details">
          <div class="publication-meta">
            <span v-if="publication.year" class="publication-badge">{{ publication.year }}</span>
            <span class="publication-badge publication-badge-secondary">{{ publication.venue }}</span>
          </div>
          <a
            v-if="publication.link"
            :href="publication.link"
            target="_blank"
            rel="noreferrer"
            class="publication-link"
          >
            <strong>{{ publication.title }}</strong>
          </a>
          <strong v-else class="publication-link">{{ publication.title }}</strong>
          <p class="author-list">
            <span v-for="(author, authorIndex) in publication.authors" :key="authorIndex">
              <span :class="{ 'bold-author': author.includes('Baozhe Zhang') }">{{ author }}</span>
              <span v-if="authorIndex < publication.authors.length - 1">, </span>
            </span>
          </p>
          <p class="venue">
            <em>{{ publication.venue }}</em>
          </p>
          <p v-if="publication.excerpt" class="excerpt">{{ publication.excerpt }}</p>
          <div class="publication-actions">
            <a
              v-if="publication.link"
              :href="publication.link"
              target="_blank"
              rel="noreferrer"
              class="publication-action"
            >
              Read paper
            </a>
            <a
              v-if="publication.github"
              :href="publication.github"
              target="_blank"
              rel="noreferrer"
              class="publication-action"
            >
              GitHub
            </a>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped>
.publication-category-group {
  margin-bottom: 2.5rem;
}

.category-heading {
  margin: 0 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--vp-c-divider-light);
  color: var(--vp-c-text-2);
  font-size: 0.85rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.publication-item {
  display: grid;
  grid-template-columns: clamp(260px, 34vw, 360px) minmax(0, 1fr);
  gap: 1.5rem;
  align-items: start;
  margin-bottom: 1.5rem;
  padding: 1.1rem;
  border: 1px solid var(--vp-c-divider-light);
  border-radius: 18px;
  background: linear-gradient(180deg, var(--vp-c-bg-soft) 0%, var(--vp-c-bg) 100%);
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.publication-item:hover {
  border-color: color-mix(in srgb, var(--vp-c-brand) 28%, var(--vp-c-divider-light));
  transform: translateY(-2px);
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.06);
}

.publication-media {
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider-light);
  background: var(--vp-c-bg-alt);
  align-self: center;
}

.publication-image {
  width: 100%;
  aspect-ratio: 16 / 10;
  height: 100%;
  object-fit: cover;
  display: block;
}

.publication-details {
  min-width: 0;
}

.publication-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-bottom: 0.8rem;
}

.publication-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.18rem 0.6rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--vp-c-brand) 12%, white);
  color: var(--vp-c-brand);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.publication-badge-secondary {
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-2);
}

.publication-link {
  color: var(--vp-c-text-1);
  font-size: 1.12rem;
  line-height: 1.35;
  text-decoration: none;
}

.publication-link:hover {
  color: var(--vp-c-brand);
}

.bold-author {
  font-weight: 700;
  color: inherit;
}

.author-list,
.venue,
.excerpt {
  margin: 0.35rem 0 0;
  line-height: 1.6;
}

.author-list,
.excerpt {
  color: var(--vp-c-text-2);
}

.author-list {
  font-size: 0.96rem;
}

.venue {
  display: none;
}

.excerpt {
  max-width: 62ch;
}

.publication-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  margin-top: 0.95rem;
}

.publication-action {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--vp-c-brand);
  font-weight: 600;
  text-decoration: none;
}

.publication-action::after {
  content: "->";
  font-size: 0.9em;
}

.publication-action:hover {
  color: var(--vp-c-brand-dark);
  text-decoration: underline;
}

:global(.dark) .publication-badge {
  background: rgba(59, 130, 246, 0.18);
  color: #dbeafe;
  border: 1px solid rgba(147, 197, 253, 0.18);
}

:global(.dark) .publication-badge-secondary {
  background: rgba(255, 255, 255, 0.06);
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

:global(.dark) .publication-link:hover,
:global(.dark) .publication-action {
  color: #93c5fd;
}

:global(.dark) .publication-action:hover {
  color: #dbeafe;
}

@media (max-width: 768px) {
  .publication-item {
    grid-template-columns: 1fr;
    gap: 0.9rem;
    padding: 0.9rem;
  }

  .publication-media {
    max-width: 240px;
  }

  .excerpt {
    display: none;
  }
}

@media (min-width: 1200px) {
  .publication-item {
    gap: 1.75rem;
  }
}
</style>
