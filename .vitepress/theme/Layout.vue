<script setup>
import { useData } from 'vitepress'
import Publications from './Publications.vue';
import Blogs from './Blogs.vue';

// https://vitepress.dev/reference/runtime-api#usedata
const { site, frontmatter } = useData()
</script>

<template>
  <div v-if="frontmatter.home">
    <h1>Baozhe Zhang 张宝哲</h1>
    <p>
      I graudated from <a href="https://www.cuhk.edu.cn/en">The Chinese University of Hong Kong, Shenzhen</a> in 2024. I am interested in reinforcement learning, motion planning, and multi-robot systems. 
    </p>

    <p>
      I am currently a research assistant and robotics engineer at <a href="http://zju-fast.com/">FAST Lab</a>. 
    </p>

    <br />

    <a href="mailto:zhang.baozhe2000@gmail.com">Email</a>
    &nbsp;/&nbsp;
    <a href="https://scholar.google.com/citations?user=L7o6M0UAAAAJ">Google Scholar</a>
    &nbsp;/&nbsp;
    <a href="https://github.com/zhangbaozhe">GitHub</a>
    &nbsp;/&nbsp;
    <a href="/blog">Blog</a>
  
    
    <h2>Research</h2>
    <Publications />
      
  </div>

  <div v-else-if="frontmatter.blog">
    <a href="/">Home</a>
    <Blogs />
  </div>

  <div v-else>
    <a href="/">Home</a> 
    &nbsp;/&nbsp;
    <a href="/blog">Blog</a>
    <Content />
  </div>
</template>
