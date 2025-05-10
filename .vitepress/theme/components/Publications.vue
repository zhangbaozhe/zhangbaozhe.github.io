<!-- <script setup>
import { ref, onMounted } from "vue";

const publications = ref([]);

onMounted(async () => {
  const response = await fetch("/publications.json"); // Adjust path if necessary
  publications.value = await response.json();
});


</script>

<template>
  <div class="publications">
    <div v-for="(pub, index) in publications" :key="index" class="publication-item">
      <img :src="pub.image" alt="Publication GIF" class="publication-image" />
      <div class="publication-details">
        <a :href="pub.link" target="_blank">
          <strong>{{ pub.title }}</strong>
        </a>
        <p class="author-list">
          <span v-for="(author, idx) in pub.authors" :key="idx">
            <span :class="{ 'bold-author': author.includes('Baozhe Zhang') }">{{ author }}</span>
            <span v-if="idx < pub.authors.length - 1">, </span>
          </span>
        </p>
        <p class="venue"><em>{{ pub.venue }}</em></p>
        <p class="excerpt">{{ pub.excerpt }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.publications {
  padding: 0px;
}

.publication-item {
  display: flex;
  flex-direction: row;
  gap: 15px;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 0px;
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
}

.publication-image {
  width: 200px;
  height: auto;
  border-radius: 5px;
  object-fit: cover;
  margin: auto;
}

.publication-details {
  flex: 1;
  min-width: 200px;
}

.bold-author {
  font-weight: bold;
  text-decoration: underline;
}

.author-list,
.venue,
.excerpt {
  font-size: 1rem;
  margin: auto;
}

.author-list {
  word-wrap: break-word;
  overflow-wrap: break-word;
  text-overflow: ellipsis;
}

.venue {
  font-style: italic;
}

.excerpt {
  word-wrap: break-word;
}



@media (max-width: 768px) {
  .publication-item {
    flex-direction: column;
    align-items: flex-start;
    padding: 0px;
  }

  .publication-image {
    width: 100%;
    max-width: 150px;
    margin-bottom: 5px;
  }

  .publication-details {
    text-align: left;
  }

  .author-list {
    word-wrap: break-word;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .venue {
    font-size: 0.9rem;
  }

  .excerpt {
    font-size: 0.9rem;
  }

  .author-list,
  .excerpt {
    display: none;
    /* Hide the author and excerpt sections by default on mobile */
  }

}

@media (max-width: 480px) {
  .publication-item {
    padding: 0px;
  }

  .publication-details {
    font-size: 0.9rem;
  }

  .author-list,
  .venue,
  .excerpt {
    font-size: 0.85rem;
  }
}
</style> -->
<script setup>
import { ref, onMounted, computed } from "vue";

const publications = ref([]);

onMounted(async () => {
  // Using try-catch for better error handling
  try {
    const response = await fetch("/publications.json");
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    publications.value = await response.json();
    // Optional: Sort publications within categories, e.g., by year descending
    publications.value.sort((a, b) => (b.year || 0) - (a.year || 0)); // Sort by year descending, handle missing years
  } catch (error) {
    console.error("Failed to fetch publications:", error);
    // Handle error, maybe display a message to the user
  }
});

// Computed property to group publications by category
const groupedPublications = computed(() => {
  const groups = {};
  publications.value.forEach(pub => {
    // Use a default category if none is provided
    const category = pub.category || 'Uncategorized';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(pub);
  });

  // Optional: Sort the categories alphabetically
  const sortedCategories = Object.keys(groups).sort();

  // Create a new object with sorted categories
  const sortedGroups = {};
  sortedCategories.forEach(category => {
    sortedGroups[category] = groups[category];
  });

  return sortedGroups;
});

</script>

<template>
  <div class="publications">
    <div v-for="(pubsInCategory, category) in groupedPublications" :key="category" class="publication-category-group">
      <h3 class="category-heading">{{ category }}</h3>
      <div v-for="(pub, index) in pubsInCategory" :key="pub.link || index" class="publication-item">
        <img :src="pub.image" alt="Publication Image or GIF" class="publication-image" />
        <div class="publication-details">
          <a :href="pub.link" target="_blank">
            <strong>{{ pub.title }}</strong>
          </a>
          <p class="author-list">
            <span v-for="(author, idx) in pub.authors" :key="idx">
              <span :class="{ 'bold-author': author.includes('Baozhe Zhang') }">{{ author }}</span>
              <span v-if="idx < pub.authors.length - 1">, </span>
            </span>
          </p>
          <p class="venue"><em>{{ pub.venue }}</em></p>
          <p class="excerpt">{{ pub.excerpt }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add styles for the category heading and group spacing */
.publication-category-group {
  margin-bottom: 40px; /* Space between categories */
}

.category-heading {
  font-size: 1.5rem;
  margin-bottom: 10px; /* Space below the category heading */
  border-bottom: 2px solid #eee; /* Optional: Add a subtle line */
  padding-bottom: 5px;
}

/* Existing styles below */
.publications {
  padding: 0px;
}

.publication-item {
  display: flex;
  flex-direction: row;
  gap: 15px;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 0px;
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
}

.publication-image {
  width: 200px;
  height: auto; /* Maintain aspect ratio */
  border-radius: 5px;
  object-fit: cover; /* Ensure image covers the area without distortion */
  margin: auto; /* Center the image if it's smaller than its container */
}

.publication-details {
  flex: 1;
  min-width: 200px; /* Ensure details section has a minimum width */
}

.bold-author {
  font-weight: bold;
  text-decoration: underline;
}

.author-list,
.venue,
.excerpt {
  font-size: 1rem;
  margin: 0; /* Reset margin to 0 for better control */
  line-height: 1.4; /* Improve readability */
}

.author-list {
  word-wrap: break-word;
  overflow-wrap: break-word;
  /* text-overflow: ellipsis; /* Ellipsis typically requires white-space: nowrap */
}

.venue {
  font-style: italic;
  margin-top: 3px; /* Add a little space above venue */
}

.excerpt {
  word-wrap: break-word;
  margin-top: 5px; /* Add space above excerpt */
}

a[target="_blank"] {
    text-decoration: none; /* Optional: Remove underline from title link */
    color: inherit; /* Optional: Keep the link color consistent */
}

/* Responsive Styles */
@media (max-width: 768px) {
  .publication-item {
    flex-direction: column;
    align-items: flex-start; /* Align items to the left */
    padding: 0px;
  }

  .publication-image {
    width: 100%; /* Image takes full width on small screens */
    max-width: 200px; /* Limit max width even on full width */
    margin-bottom: 10px; /* More space below image */
    margin-left: 0; /* Align left */
    margin-right: auto; /* Keep auto on right to potentially center if max-width is hit */
  }

  .publication-details {
    text-align: left; /* Align text left */
    min-width: auto; /* Remove minimum width constraint */
    width: 100%; /* Make details take full width */
  }

  .author-list {
      /* Ensure author list is visible and wraps */
      display: block;
      white-space: normal;
      overflow-wrap: break-word;
      word-wrap: break-word;
      text-overflow: clip;
      font-size: 0.9rem; /* Adjust font size for mobile */
      margin-bottom: 5px; /* Space below author list */
  }

  .venue {
      /* Ensure venue is visible */
      display: block;
      font-size: 0.9rem; /* Adjust font size for mobile */
      margin-top: 0; /* Reset top margin */
      margin-bottom: 5px; /* Space below venue */
  }

  /* --- CHANGE HERE --- */
  .excerpt {
    display: none; /* Hide the excerpt on mobile */
  }
  /* --- END CHANGE --- */


  .category-heading {
      font-size: 1.3rem; /* Slightly smaller heading */
      margin-bottom: 15px;
  }

  .publication-category-group {
      margin-bottom: 30px; /* Less space between categories */
  }
}

@media (max-width: 480px) {
  /* These styles are less critical now that 768px handles main layout */
  /* Keep them if you need specific adjustments below 480px */

  .publication-details {
    font-size: 0.9rem; /* This is already set at 768px breakpoint, might be redundant */
  }

  /* These font sizes are also set at 768px breakpoint, might be redundant */
  .author-list,
  .venue {
    font-size: 0.85rem;
  }

   .category-heading {
      font-size: 1.2rem;
      margin-bottom: 10px;
  }
}
</style>