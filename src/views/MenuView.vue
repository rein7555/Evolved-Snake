<template>
  <div class="menu-view">
    <div class="menu-container">
      <h1 class="title">🐍 貪吃蛇遊戲</h1>
      <p class="subtitle">選擇難度開始遊戲</p>

      <div class="difficulty-buttons">
        <button class="difficulty-btn easy" @click="selectDifficulty('easy')">
          🟢 簡單<span class="speed">(慢速)</span>
        </button>
        <button class="difficulty-btn medium" @click="selectDifficulty('medium')">
          🟡 中等<span class="speed">(平衡)</span>
        </button>
        <button class="difficulty-btn hard" @click="selectDifficulty('hard')">
          🔴 困難<span class="speed">(快速)</span>
        </button>
      </div>

      <div class="instructions">
        <h3>遊戲說明</h3>
        <ul>
          <li>使用 ⬅️ ➡️ ⬆️ ⬇️ 或 WASD 控制蛇的方向</li>
          <li>吃到食物 🔴 獲得分數</li>
          <li>撞到牆壁或自己會遊戲結束</li>
          <li>按空格鍵暫停遊戲</li>
          <li>困難難度的分數翻倍！</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore'
import { useRouter } from 'vue-router'
import type { GameDifficulty } from '@/stores/gameStore'

const gameStore = useGameStore()
const router = useRouter()

const selectDifficulty = (difficulty: GameDifficulty) => {
  gameStore.initializeGame(difficulty)
  router.push('/game')
}
</script>

<style scoped>
.menu-view {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.menu-container {
  background: white;
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 100%;
  text-align: center;
}

.title {
  font-size: 48px;
  margin: 0 0 10px 0;
  color: #333;
  font-weight: bold;
}

.subtitle {
  font-size: 18px;
  color: #666;
  margin: 0 0 40px 0;
}

.difficulty-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 40px;
}

.difficulty-btn {
  padding: 20px 30px;
  font-size: 18px;
  font-weight: bold;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.difficulty-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.difficulty-btn.easy {
  background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
}

.difficulty-btn.medium {
  background: linear-gradient(135deg, #ffa726 0%, #fb8c00 100%);
}

.difficulty-btn.hard {
  background: linear-gradient(135deg, #ef5350 0%, #e53935 100%);
}

.difficulty-btn .speed {
  font-size: 14px;
  opacity: 0.9;
}

.instructions {
  text-align: left;
  background: #f5f5f5;
  padding: 20px;
  border-radius: 10px;
}

.instructions h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 18px;
}

.instructions ul {
  margin: 0;
  padding-left: 20px;
  color: #555;
  font-size: 14px;
  line-height: 1.8;
}

.instructions li {
  margin-bottom: 8px;
}
</style>
