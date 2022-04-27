<script setup>
import dayjs from 'dayjs'

defineProps({
  datetime: {
    type: Date,
    required: true,
  },
})

const DATE_FORMAT = 'DD MMM YY, hh:mm a'
</script>

<template>
  <time class="datetime">{{ dayjs(datetime).format(DATE_FORMAT) }}</time>
</template>

<style>
.datetime {
  font-size: var(--fs-300);
  font-weight: 300;
  color: #8d8d8d;
  text-align: right;
}
</style>
