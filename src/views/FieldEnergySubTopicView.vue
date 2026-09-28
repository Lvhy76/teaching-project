<script setup lang="ts">
import { fieldEnergySubTopic } from '@/data/lessons'
import SubTopicLessonsView from '@/views/SubTopicLessonsView.vue'
</script>

<template>
  <SubTopicLessonsView
    :crumb-parent="{ title: '电磁学专题', to: '/electromagnetism' }"
    :title="fieldEnergySubTopic.title"
    :summary="fieldEnergySubTopic.summary"
    :lessons="fieldEnergySubTopic.lessons"
  />
</template>
