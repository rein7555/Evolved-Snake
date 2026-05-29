<template>
  <div class="result-view">
    <div class="result-container">
      <div class="result-content">
        <h1 class="title">🎮 遊戲結束</h1>

        <div class="score-display">
          <div class="final-score">
            <span class="label">最終分數</span>
            <span class="score">{{ gameStore.score }}</span>
          </div>
          <div class="game-stats">
            <div class="stat">
              <span class="stat-label">難度</span>
              <span class="stat-value">{{ difficultyLabel[gameStore.difficulty] }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">蛇長</span>
              <span class="stat-value">{{ gameStore.snake.length }}</span>
            </div>
          </div>
        </div>

        <div class="highscores-section">
          <h2>🏆 排行榜 (前 10 名)</h2>
          <div v-if="gameStore.highscores.length === 0" class="no-highscores">
            <p>還沒有排行榜紀錄，開始遊戲創造新紀錄吧！</p>
          </div>
          <div v-else class="highscores-list">
            <div
              v-for="(score, index) in gameStore.highscores"
              :key="index"
              :class="['highscore-item', { current: isCurrentScore(score) }]"
            >
              <span class="rank">{{ index + 1 }}</span>
              <span class="score-value">{{ score.score }}</span>
              <span class="difficulty-badge">{{ difficultyLabel[score.difficulty] }}</span>
              <span class="date">{{ formatDate(score.timestamp) }}</span>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <button class="btn restart" @click="restartGame">🔄 重新開始</button>
          <button class="btn menu" @click="backToMenu">🏠 回到菜單</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore'
import { useRouter } from 'vue-router'
import type { Highscore } from '@/stores/gameStore'

const gameStore = useGameStore()
const router = useRouter()

const difficultyLabel: Record<string, string> = {
  easy: '🟢 簡單',
  medium: '🟡 中等',
  hard: '🔴 困難',
}

const isCurrentScore = (score: Highscore) => {
  return (
    score.score === gameStore.score &&
    score.difficulty === gameStore.difficulty &&
    Math.abs(score.timestamp - Date.now()) < 5000
  )
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  const today = new Date()

  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString('zh-TW')
}

const restartGame = () => {
  gameStore.resetToMenu()
  router.push('/')
}

const backToMenu = () => {
  gameStore.resetToMenu()
  router.push('/')
}
</script>

<style scoped>
.result-view {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.result-container {
  background: white;
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
}

.result-content {
  text-align: center;
}

.title {
  font-size: 42px;
  margin: 0 0 30px 0;
  color: #333;
}

.score-display {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
  color: white;
}

.final-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.final-score .label {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 10px;
}

.final-score .score {
  font-size: 56px;
  font-weight: bold;
}

.game-stats {
  display: flex;
  gap: 40px;
  justify-content: center;
  padding-top: 20px;
  border-top: 2px solid rgba(255, 255, 255, 0.3);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
  text-transform: uppercase;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
}

.highscores-section {
  margin-bottom: 30px;
  text-align: left;
}

.highscores-section h2 {
  font-size: 20px;
  margin: 0 0 15px 0;
  color: #333;
  text-align: center;
}

.no-highscores {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  color: #999;
}

.highscores-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.highscore-item {
  display: grid;
  grid-template-columns: 40px 1fr 100px 100px;
  gap: 15px;
  align-items: center;
  padding: 12px 15px;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid #ddd;
  transition: all 0.3s ease;
}

.highscore-item.current {
  background: #fffacd;
  border-left-color: #ffa726;
  box-shadow: 0 2px 8px rgba(255, 167, 38, 0.2);
}

.rank {
  font-weight: bold;
  color: #667eea;
  font-size: 18px;
}

.score-value {
  font-weight: bold;
  font-size: 18px;
  color: #333;
}

.difficulty-badge {
  font-size: 12px;
  font-weight: bold;
}

.date {
  font-size: 12px;
  color: #999;
  text-align: right;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.btn {
  padding: 15px 30px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn.restart {
  background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
  color: white;
}

.btn.restart:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(67, 160, 71, 0.3);
}

.btn.menu {
  background: #f5f5f5;
  color: #333;
  border: 2px solid #ddd;
}

.btn.menu:hover {
  background: #efefef;
  border-color: #999;
}

@media (max-width: 600px) {
  .result-container {
    padding: 30px 20px;
  }

  .title {
    font-size: 32px;
  }

  .highscore-item {
    grid-template-columns: 30px 1fr 80px;
    font-size: 12px;
  }

  .date {
    grid-column: 1 / -1;
    text-align: left;
    margin-top: 5px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
