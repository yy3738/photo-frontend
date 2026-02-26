import { defineStore } from 'pinia'
import { ref } from 'vue'
import { http } from '@/utils/request.js'
import { PAGE_SIZE } from '@/constants/index.js'

export const usePhotoStore = defineStore('photo', () => {
  const categories = ref([])
  const currentCategory = ref('')  // '' 表示全部
  const list = ref([])
  const page = ref(1)
  const hasMore = ref(true)
  const loading = ref(false)

  async function fetchCategories() {
    const res = await http.get('/categories')
    categories.value = res ?? []
    return categories.value
  }

  async function fetchList(reset = false) {
    if (loading.value) return
    if (!reset && !hasMore.value) return

    loading.value = true
    if (reset) {
      page.value = 1
      list.value = []
      hasMore.value = true
    }

    try {
      const params = {
        page: page.value,
        pageSize: PAGE_SIZE,
      }
      if (currentCategory.value) {
        params.categoryId = currentCategory.value
      }
      const res = await http.get('/photos', params)
      const newList = res?.list ?? []
      list.value = reset ? newList : [...list.value, ...newList]
      hasMore.value = newList.length === PAGE_SIZE
      page.value += 1
    } finally {
      loading.value = false
    }
  }

  function setCategory(categoryId) {
    currentCategory.value = categoryId
    fetchList(true)
  }

  return {
    categories,
    currentCategory,
    list,
    hasMore,
    loading,
    fetchCategories,
    fetchList,
    setCategory,
  }
})
