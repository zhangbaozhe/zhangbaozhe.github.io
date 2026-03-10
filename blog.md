---
page: true
title: Blogs
aside: false
---
<script setup lang="ts">
import Page from "./.vitepress/theme/components/Page.vue";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useData } from "vitepress";

const { theme } = useData();
const pageSize = Number(theme.value.pageSize ?? 10);

const getCurrentPage = () => {
  if (typeof window === "undefined") {
    return 1;
  }

  const rawPage = Number(new URLSearchParams(window.location.search).get("page") ?? "1");
  return Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
};

const pageCurrent = ref(getCurrentPage());
const pagesNum = computed(() => Math.max(1, Math.ceil(theme.value.posts.length / pageSize)));
const normalizedPageCurrent = computed(() => Math.min(pageCurrent.value, pagesNum.value));
const posts = computed(() => {
  const start = (normalizedPageCurrent.value - 1) * pageSize;
  return theme.value.posts.slice(start, start + pageSize);
});

const syncCurrentPage = () => {
  pageCurrent.value = getCurrentPage();
};

onMounted(() => {
  syncCurrentPage();
  window.addEventListener("popstate", syncCurrentPage);
});

onUnmounted(() => {
  window.removeEventListener("popstate", syncCurrentPage);
});
</script>
<Page :posts="posts" :pageCurrent="normalizedPageCurrent" :pagesNum="pagesNum" />
