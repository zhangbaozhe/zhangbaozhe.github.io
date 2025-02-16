<script setup>
import { ref, onMounted } from "vue";

const publications = ref([]);

onMounted(async () => {
  const response = await fetch("/publications.json"); // Adjust path if necessary
  publications.value = await response.json();
  console.log(publications.value);
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
        <p>
          <span v-for="(author, idx) in pub.authors" :key="idx">
            <span :class="{ 'bold-author': author.includes('Baozhe Zhang') }">{{ author }}</span>
            <span v-if="idx < pub.authors.length - 1">, </span>
          </span>
        </p>
        <p><em>{{ pub.venue }}</em></p>
        <p>{{ pub.excerpt }}</p>
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
  gap: 15px;
  align-items: center;
  margin-bottom: 20px;

  padding: 10px;
  border-radius: 8px;
}

.publication-image {
  width: 200px;
  border-radius: 5px;
}

.publication-details {
  flex: 1;
}

.bold-author {
  font-weight: bold;
}
</style>
