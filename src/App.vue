<script setup>
import { onLaunch } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user.js'

onLaunch(() => {
  const userStore = useUserStore()
  if (userStore.isLoggedIn) {
    userStore.fetchUserInfo().catch(() => {})
  }
})
</script>

<style lang="scss">
@import './uni.scss';

page {
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
}
</style>
