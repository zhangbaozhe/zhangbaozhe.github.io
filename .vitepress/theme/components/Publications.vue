<script setup>
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
</style>
