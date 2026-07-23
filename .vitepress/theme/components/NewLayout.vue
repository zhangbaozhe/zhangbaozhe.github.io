<template>
    <Layout :class="{ 'is-home-page': isHomePage }">
        <template #doc-before>
            <div class="post-info post-meta" v-if="!$frontmatter.page">
                {{ $frontmatter.date?.substring(0,10) }} &nbsp;&nbsp; <span v-for="item in $frontmatter.tags"><a :href="withBase(`/pages/tags.html?tag=${item}`)"> {{ item }}</a></span>
            </div>
        </template>
    </Layout>
    <Copyright />
</template>
<script setup>
import DefaultTheme from 'vitepress/theme'
import Copyright from './Copyright.vue'
import { computed } from 'vue'
import { useRoute, withBase } from "vitepress";
const { Layout } = DefaultTheme
const route = useRoute()
const isHomePage = computed(() => route.path === withBase('/'))
</script>
