import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type GameDifficulty = 'easy' | 'medium' | 'hard'
export type GameState = 'menu' | 'playing' | 'paused' | 'gameOver'
export type FoodType = 'apple' | 'diamond'

export type SnakePosition = [number, number]

interface Food {
  position: SnakePosition
  type: FoodType
}

const GRID_SIZE = 10
const INITIAL_SNAKE_LENGTH = 3

interface Highscore {
  score: number
  difficulty: GameDifficulty
  timestamp: number
}

export const useGameStore = defineStore('game', () => {
  // 遊戲狀態
  const gameState = ref<GameState>('menu')
  const difficulty = ref<GameDifficulty>('medium')
  const score = ref(0)
  const snake = ref<SnakePosition[]>([
    [5, 5],
    [5, 4],
    [5, 3],
  ])
  const food = ref<Food>({
    position: [7, 7],
    type: 'apple',
  })
  const bomb = ref<SnakePosition | null>(null)
  const direction = ref<'up' | 'down' | 'left' | 'right'>('right')
  const nextDirection = ref<'up' | 'down' | 'left' | 'right'>('right')

  // 難度配置
  const difficultyConfig = {
    easy: { speed: 150, scoreMultiplier: 1 },
    medium: { speed: 100, scoreMultiplier: 1 },
    hard: { speed: 50, scoreMultiplier: 2 },
  }

  // 排行榜
  const highscores = ref<Highscore[]>(loadHighscores())

  // 計算屬性
  const gridSize = computed(() => GRID_SIZE)
  const currentSpeed = computed(() => difficultyConfig[difficulty.value].speed)
  const currentScoreMultiplier = computed(() => difficultyConfig[difficulty.value].scoreMultiplier)

  // LocalStorage 方法
  function loadHighscores(): Highscore[] {
    const stored = localStorage.getItem('snakeHighscores')
    return stored ? JSON.parse(stored) : []
  }

  function saveHighscores() {
    localStorage.setItem('snakeHighscores', JSON.stringify(highscores.value))
  }

  // 初始化遊戲
  function initializeGame(selectedDifficulty: GameDifficulty) {
    difficulty.value = selectedDifficulty
    snake.value = [
      [5, 5],
      [5, 4],
      [5, 3],
    ]
    food.value = generateFood()
    bomb.value = generateBomb(food.value.position)
    direction.value = 'right'
    nextDirection.value = 'right'
    score.value = 0
    gameState.value = 'playing'
  }

  // 生成食物
  function generateFood(): Food {
    let newPosition: SnakePosition
    let isValid = false

    while (!isValid) {
      newPosition = [Math.floor(Math.random() * GRID_SIZE), Math.floor(Math.random() * GRID_SIZE)]
      // 檢查食物是否與蛇重疊
      isValid = !snake.value.some((pos) => pos[0] === newPosition[0] && pos[1] === newPosition[1])
    }

    // 10% 機率生成鑽石，90% 機率生成蘋果
    const foodType: FoodType = Math.random() < 0.1 ? 'diamond' : 'apple'

    return {
      position: newPosition,
      type: foodType,
    }
  }

  // 保留舊函數名以保持相容性
  function generateFoodPosition(): SnakePosition {
    return generateFood().position
  }

  // 生成炸彈
  function generateBomb(foodPosition: SnakePosition): SnakePosition {
    let newPosition: SnakePosition
    let isValid = false

    while (!isValid) {
      newPosition = [Math.floor(Math.random() * GRID_SIZE), Math.floor(Math.random() * GRID_SIZE)]
      // 檢查位置是否與蛇、食物重疊
      const isSnake = snake.value.some(
        (pos) => pos[0] === newPosition[0] && pos[1] === newPosition[1],
      )
      const isFood = foodPosition[0] === newPosition[0] && foodPosition[1] === newPosition[1]
      isValid = !isSnake && !isFood
    }

    return newPosition
  }

  // 設置方向
  function setDirection(newDir: 'up' | 'down' | 'left' | 'right') {
    // 防止反向移動
    if (
      (direction.value === 'up' && newDir === 'down') ||
      (direction.value === 'down' && newDir === 'up') ||
      (direction.value === 'left' && newDir === 'right') ||
      (direction.value === 'right' && newDir === 'left')
    ) {
      return
    }
    nextDirection.value = newDir
  }

  // 更新方向（遊戲循環內調用）
  function updateDirection() {
    direction.value = nextDirection.value
  }

  // 移動蛇
  function moveSnake() {
    const head = [...snake.value[0]] as SnakePosition

    // 根據方向移動頭
    switch (direction.value) {
      case 'up':
        head[1] -= 1
        break
      case 'down':
        head[1] += 1
        break
      case 'left':
        head[0] -= 1
        break
      case 'right':
        head[0] += 1
        break
    }

    snake.value.unshift(head)

    // 檢查是否吃到食物
    if (head[0] === food.value.position[0] && head[1] === food.value.position[1]) {
      // 根據食物類型決定獎勵
      if (food.value.type === 'diamond') {
        score.value += 30 * currentScoreMultiplier.value
        snake.value.push([...snake.value[snake.value.length - 1]])
        snake.value.push([...snake.value[snake.value.length - 1]])
      } else {
        score.value += 10 * currentScoreMultiplier.value
      }

      // 生成新食物和新炸彈
      food.value = generateFood()
      bomb.value = generateBomb(food.value.position)
      return true
    }

    // 沒吃到食物就移除尾部
    snake.value.pop()
    return false
  }

  // 檢測碰撞
  function checkCollision(): boolean {
    const head = snake.value[0]

    // 檢測牆碰撞
    if (head[0] < 0 || head[0] >= GRID_SIZE || head[1] < 0 || head[1] >= GRID_SIZE) {
      return true
    }

    // 檢測自身碰撞（不包括頭自己）
    for (let i = 1; i < snake.value.length; i++) {
      if (head[0] === snake.value[i][0] && head[1] === snake.value[i][1]) {
        return true
      }
    }

    return false
  }

  // 檢測炸彈碰撞
  function checkBombCollision(): boolean {
    if (!bomb.value) return false
    const head = snake.value[0]
    return head[0] === bomb.value[0] && head[1] === bomb.value[1]
  }

  // 暫停/繼續
  function togglePause() {
    if (gameState.value === 'playing') {
      gameState.value = 'paused'
    } else if (gameState.value === 'paused') {
      gameState.value = 'playing'
    }
  }

  // 遊戲結束
  function endGame() {
    gameState.value = 'gameOver'
    addHighscore({
      score: score.value,
      difficulty: difficulty.value,
      timestamp: Date.now(),
    })
  }

  // 添加排行榜
  function addHighscore(record: Highscore) {
    highscores.value.push(record)
    highscores.value.sort((a, b) => b.score - a.score)
    highscores.value = highscores.value.slice(0, 10) // 保留前 10 名
    saveHighscores()
  }

  // 重置遊戲回菜單
  function resetToMenu() {
    gameState.value = 'menu'
  }

  return {
    // 狀態
    gameState,
    difficulty,
    score,
    snake,
    food,
    bomb,
    direction,
    nextDirection,
    highscores,

    // 計算屬性
    gridSize,
    currentSpeed,
    currentScoreMultiplier,

    // 方法
    initializeGame,
    generateFoodPosition,
    generateBomb,
    setDirection,
    updateDirection,
    moveSnake,
    checkCollision,
    checkBombCollision,
    togglePause,
    endGame,
    resetToMenu,
    addHighscore,
  }
})
