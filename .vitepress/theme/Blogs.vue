<script setup>
import { data as blogs } from './blog.data.ts';
</script>

<template>
  <div class="blog-list">
    <h1>📝 Blog Articles</h1>
    <ul>
      <li v-for="blog in blogs" :key="blog.url">
        <a :href="`${blog.url}`">
          <strong>{{ blog.title }}</strong>
        </a>
        <br>
        <span class="date">{{ blog.date.string }}</span>
        <p>{{ blog.description }}</p>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.blog-list {
  padding: 20px;
  max-width: 800px;
  margin: auto;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin-bottom: 10px;
  padding: 15px;
  border-radius: 8px;
  background: #ffffd0;
}

a {
  font-size: 18px;
  color: #1772d0;
  text-decoration: none;
}

a:hover {
  color: #f09228;
}

.date {
  font-size: 14px;
  color: gray;
}
</style>
