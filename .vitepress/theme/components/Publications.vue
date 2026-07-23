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
            :loading="index === 0 ? 'eager' : 'lazy'"
          />
        </div>
        <div class="publication-details">
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
          <p class="publication-venue">{{ publication.venue }}</p>
          <p v-if="publication.excerpt" class="excerpt">{{ publication.excerpt }}</p>
          <div class="publication-actions">
            <a
              v-if="publication.link"
              :href="publication.link"
              target="_blank"
              rel="noreferrer"
              class="publication-action"
            >
              Paper
            </a>
            <span v-if="publication.link && publication.github" aria-hidden="true">·</span>
            <a
              v-if="publication.github"
              :href="publication.github"
              target="_blank"
              rel="noreferrer"
              class="publication-action"
            >
              Code
            </a>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped>
.publication-category-group {
  margin-bottom: 2.75rem;
}

.category-heading {
  margin: 0 0 0.35rem;
  padding: 0;
  border: 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem !important;
  font-weight: 400 !important;
  letter-spacing: 0;
}

.publication-item {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 1.4rem;
  align-items: start;
  margin: 0;
  padding: 1.35rem 0;
}

.publication-item + .publication-item {
  border-top: 1px solid var(--vp-c-divider);
}

.publication-media {
  overflow: hidden;
  aspect-ratio: 16 / 10;
  background: var(--vp-c-bg-soft);
}

.publication-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.publication-details {
  min-width: 0;
}

.publication-link {
  display: inline-block;
  color: var(--vp-c-text-1);
  font-size: 1.05rem;
  line-height: 1.4;
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
.publication-venue,
.excerpt {
  margin: 0.3rem 0 0;
  line-height: 1.55;
}

.author-list,
.excerpt {
  color: var(--vp-c-text-2);
}

.author-list {
  font-size: 0.9rem;
}

.publication-venue {
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
}

.excerpt {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  max-width: 62ch;
  margin-top: 0.55rem;
  font-size: 0.9rem;
}

.publication-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.6rem;
  color: var(--vp-c-text-3);
  font-size: 0.9rem;
}

.publication-action {
  color: var(--vp-c-brand-1);
  font-weight: 400;
  text-decoration: none;
}

.publication-action:hover {
  color: var(--site-link-hover);
}

@media (max-width: 700px) {
  .publication-item {
    grid-template-columns: 1fr;
    gap: 0.85rem;
    padding: 1.2rem 0;
  }

  .publication-media {
    width: 100%;
  }

  .excerpt {
    display: none;
  }
}
</style>
