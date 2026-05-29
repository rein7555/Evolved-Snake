<template>
  <div class="game-view">
    <div class="game-container">
      <div class="game-header">
        <div class="info">
          <div class="info-item">
            <span class="label">難度</span>
            <span class="value">{{ difficultyLabel[gameStore.difficulty] }}</span>
          </div>
          <div class="info-item">
            <span class="label">分數</span>
            <span class="value">{{ gameStore.score }}</span>
          </div>
          <div class="info-item">
            <span class="label">蛇長</span>
            <span class="value">{{ gameStore.snake.length }}</span>
          </div>
        </div>
        <button class="end-btn" @click="endGame">結束遊戲</button>
      </div>

      <div class="game-grid-wrapper">
        <div
          class="game-grid"
          :style="{ gridTemplateColumns: `repeat(${gameStore.gridSize}, 1fr)` }"
        >
          <div
            v-for="(cell, index) in gridCells"
            :key="index"
            :class="['cell', cell.type]"
            :style="cell.style"
          >
            <span v-if="cell.type === 'food'" class="food-emoji">🍎</span>
            <span v-if="cell.type === 'diamond'" class="food-emoji">💎</span>
            <span v-if="cell.type === 'bomb'" class="food-emoji">💣</span>
          </div>
        </div>
      </div>

      <div v-if="gameStore.gameState === 'paused'" class="pause-overlay">
        <div class="pause-message">⏸️ 已暫停</div>
      </div>

      <div class="game-footer">
        <p class="hint">💡 使用方向鍵/WASD 控制，按空格暫停</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore'
import { useRouter } from 'vue-router'
import { computed, onMounted, onUnmounted, ref } from 'vue'

const gameStore = useGameStore()
const router = useRouter()
let gameLoopInterval: ReturnType<typeof setInterval> | null = null

const difficultyLabel: Record<string, string> = {
  easy: '🟢 簡單',
  medium: '🟡 中等',
  hard: '🔴 困難',
}

const audioContext = ref<AudioContext | null>(null)

const getAudioContext = () => {
  if (!audioContext.value) {
    audioContext.value = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  if (audioContext.value.state === 'suspended') {
    audioContext.value.resume()
  }
  return audioContext.value
}

const playTone = (frequency: number, duration = 0.08, type: OscillatorType = 'sine') => {
  const ctx = getAudioContext()
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()

  oscillator.type = type
  oscillator.frequency.value = frequency
  oscillator.connect(gain)
  gain.connect(ctx.destination)

  gain.gain.setValueAtTime(0.0001, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)

  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + duration)
}

const playMoveSound = () => {
  playTone(440, 0.05, 'triangle')
}

const playAppleSound = () => {
  playTone(880, 0.12, 'square')
}

// 計算網格單元格
const gridCells = computed(() => {
  const cells = []

  for (let y = 0; y < gameStore.gridSize; y++) {
    for (let x = 0; x < gameStore.gridSize; x++) {
      let type = 'empty'

      // 檢查是否是蛇
      const isSnake = gameStore.snake.some((pos) => pos[0] === x && pos[1] === y)
      if (isSnake) {
        type = gameStore.snake[0][0] === x && gameStore.snake[0][1] === y ? 'head' : 'body'
      }

      // 檢查是否是食物
      if (gameStore.food.position[0] === x && gameStore.food.position[1] === y) {
        type = gameStore.food.type === 'diamond' ? 'diamond' : 'food'
      }

      // 檢查是否是炸彈
      if (gameStore.bomb && gameStore.bomb[0] === x && gameStore.bomb[1] === y) {
        type = 'bomb'
      }

      cells.push({
        type,
        style: {},
      })
    }
  }

  return cells
})

// 遊戲循環
const startGameLoop = () => {
  if (gameLoopInterval) clearInterval(gameLoopInterval)

  gameLoopInterval = setInterval(() => {
    if (gameStore.gameState !== 'playing') {
      return
    }

    // 更新方向
    gameStore.updateDirection()

    // 移動蛇並根據結果播放聲音
    const ateFood = gameStore.moveSnake()
    if (ateFood) {
      playAppleSound()
    }

    // 檢測碰撞
    if (gameStore.checkCollision()) {
      gameStore.endGame()
      if (gameLoopInterval) clearInterval(gameLoopInterval)
      // 自動導航到結果頁面
      setTimeout(() => {
        router.push('/result')
      }, 500)
    }

    // 檢測炸彈碰撞
    if (gameStore.checkBombCollision()) {
      gameStore.endGame()
      if (gameLoopInterval) clearInterval(gameLoopInterval)
      setTimeout(() => {
        router.push('/result')
      }, 500)
    }
  }, gameStore.currentSpeed)
}

// 停止遊戲循環
const stopGameLoop = () => {
  if (gameLoopInterval) {
    clearInterval(gameLoopInterval)
    gameLoopInterval = null
  }
}

// 鍵盤事件處理
const handleKeyDown = (event: KeyboardEvent) => {
  const key = event.key.toLowerCase()

  // 暫停功能（空格鍵）
  if (key === ' ') {
    event.preventDefault()
    gameStore.togglePause()

    // 如果從暫停恢復，重新啟動遊戲循環
    if (gameStore.gameState === 'playing' && !gameLoopInterval) {
      startGameLoop()
    }
    return
  }

  // 方向控制
  switch (key) {
    case 'arrowup':
    case 'w':
      event.preventDefault()
      gameStore.setDirection('up')
      break
    case 'arrowdown':
    case 's':
      event.preventDefault()
      gameStore.setDirection('down')
      break
    case 'arrowleft':
    case 'a':
      event.preventDefault()
      gameStore.setDirection('left')
      break
    case 'arrowright':
    case 'd':
      event.preventDefault()
      gameStore.setDirection('right')
      break
  }
}

// 掛載時啟動遊戲循環和事件監聽器
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  startGameLoop()
})

// 卸載時停止遊戲循環和移除事件監聽器
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  stopGameLoop()
})

const endGame = () => {
  stopGameLoop()
  gameStore.gameState = 'gameOver'
  router.push('/result')
}
</script>

<style scoped>
.game-view {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.game-container {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 800px;
  width: 100%;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.info {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.info-item .label {
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
  font-weight: bold;
  letter-spacing: 1px;
}

.info-item .value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.end-btn {
  padding: 10px 20px;
  background: #ef5350;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.end-btn:hover {
  background: #e53935;
  transform: translateY(-2px);
}

.game-grid-wrapper {
  position: relative;
  margin-bottom: 20px;
}

.game-grid {
  display: grid;
  gap: 1px;
  background: #ddd;
  padding: 1px;
  border-radius: 10px;
  overflow: hidden;
  aspect-ratio: 1;
}

.cell {
  background: #f5f5f5;
  border-radius: 0;
}

.cell.head {
  background: #4caf50;
  box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.2);
}

.cell.body {
  background: #81c784;
}

.cell.food,
.cell.diamond,
.cell.bomb {
  background: #ffffffcc;
  box-shadow: inset 0 0 0 1px rgba(255, 107, 107, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  height: 100%;
}

.cell.bomb {
  background: #ffcccc;
  box-shadow: inset 0 0 0 1px rgba(255, 0, 0, 0.5);
}

.food-emoji {
  font-size: 2rem;
  line-height: 1;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
}

.cell.empty {
  background: #fafafa;
}

.pause-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  z-index: 10;
}

.pause-message {
  font-size: 48px;
  font-weight: bold;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.game-footer {
  text-align: center;
  color: #999;
  font-size: 14px;
}

.hint {
  margin: 0;
}

@media (max-width: 600px) {
  .game-container {
    padding: 15px;
  }

  .game-header {
    flex-direction: column;
    gap: 15px;
  }

  .info {
    gap: 20px;
    justify-content: center;
  }
}
</style>
