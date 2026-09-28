<script setup lang="ts">
import { electrostaticsSubTopic } from '@/data/lessons'
import SubTopicLessonsView from '@/views/SubTopicLessonsView.vue'
</script>

<template>
  <SubTopicLessonsView
    :crumb-parent="{ title: '电磁学专题', to: '/electromagnetism' }"
    :title="electrostaticsSubTopic.title"
    :summary="electrostaticsSubTopic.summary"
    :lessons="electrostaticsSubTopic.lessons"
  />
</template>
