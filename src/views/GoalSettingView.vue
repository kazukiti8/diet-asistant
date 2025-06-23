<template>
  <div class="min-h-screen bg-gray-50 pb-24">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <router-link to="/home" class="mr-3 text-gray-600 hover:text-gray-800">
              <i class="fas fa-arrow-left text-xl"></i>
            </router-link>
            <h1 class="text-xl font-bold">目標設定</h1>
          </div>
          <div class="flex space-x-2">
            <button @click="showCurrentGoals = true" class="p-2 text-gray-600 hover:text-gray-800">
              <i class="fas fa-eye text-xl"></i>
            </button>
            <button @click="resetGoals" class="p-2 text-gray-600 hover:text-gray-800">
              <i class="fas fa-redo text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p class="text-gray-600">データを読み込み中...</p>
      </div>
    </div>

    <!-- Main Content -->
    <main v-else class="container mx-auto px-4 py-6">
      <!-- Progress Steps -->
      <section class="mb-8">
        <div class="card">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold">目標設定の進捗</h2>
            <span class="text-sm text-gray-500">{{ currentStep }}/{{ totalSteps }}</span>
          </div>
          
          <div class="flex items-center space-x-2 mb-6">
            <div
              v-for="(step, index) in steps"
              :key="step.id"
              class="flex-1 flex items-center"
            >
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition"
                :class="getStepClass(index)"
              >
                <i v-if="step.completed" class="fas fa-check"></i>
                <span v-else>{{ index + 1 }}</span>
              </div>
              <div
                v-if="index < steps.length - 1"
                class="flex-1 h-1 mx-2 transition"
                :class="getStepLineClass(index)"
              ></div>
            </div>
          </div>
          
          <div class="text-center">
            <p class="text-sm text-gray-600">{{ steps[currentStepIndex].description }}</p>
          </div>
        </div>
      </section>

      <!-- Step 1: Basic Information -->
      <section v-if="currentStep === 1" class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">基本情報</h2>
          
          <form @submit.prevent="nextStep" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="age" class="block text-sm font-medium text-gray-700 mb-2">
                  年齢
                </label>
                <input
                  id="age"
                  v-model.number="goalForm.age"
                  type="number"
                  class="input-field"
                  placeholder="例: 25"
                  min="10"
                  max="100"
                  required
                />
              </div>
              <div>
                <label for="gender" class="block text-sm font-medium text-gray-700 mb-2">
                  性別
                </label>
                <select
                  id="gender"
                  v-model="goalForm.gender"
                  class="input-field"
                  required
                >
                  <option value="">選択してください</option>
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                </select>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="height" class="block text-sm font-medium text-gray-700 mb-2">
                  身長 (cm)
                </label>
                <input
                  id="height"
                  v-model.number="goalForm.height"
                  type="number"
                  class="input-field"
                  placeholder="例: 170"
                  min="100"
                  max="250"
                  required
                />
              </div>
              <div>
                <label for="currentWeight" class="block text-sm font-medium text-gray-700 mb-2">
                  現在の体重 (kg)
                </label>
                <input
                  id="currentWeight"
                  v-model.number="goalForm.currentWeight"
                  type="number"
                  class="input-field"
                  placeholder="例: 65.5"
                  min="30"
                  max="200"
                  step="0.1"
                  required
                />
              </div>
            </div>
            
            <div>
              <label for="activityLevel" class="block text-sm font-medium text-gray-700 mb-2">
                活動レベル
              </label>
              <select
                id="activityLevel"
                v-model="goalForm.activityLevel"
                class="input-field"
                required
              >
                <option value="">選択してください</option>
                <option value="sedentary">座り仕事中心（運動なし）</option>
                <option value="lightly">軽い運動（週1-3回）</option>
                <option value="moderately">中程度の運動（週3-5回）</option>
                <option value="very">激しい運動（週6-7回）</option>
                <option value="extremely">非常に激しい運動（毎日2回以上）</option>
              </select>
            </div>
            
            <div class="flex justify-end">
              <button type="submit" class="btn-primary">
                次へ <i class="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          </form>
        </div>
      </section>

      <!-- Step 2: Goal Setting -->
      <section v-if="currentStep === 2" class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">目標設定</h2>
          
          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-4">現在の状況</h3>
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div class="text-center p-3 bg-blue-50 rounded-lg">
                <div class="text-lg font-bold text-blue-600">{{ calculatedBMI }}</div>
                <div class="text-sm text-gray-600">BMI</div>
              </div>
              <div class="text-center p-3 bg-green-50 rounded-lg">
                <div class="text-lg font-bold text-green-600">{{ calculatedBMR }}kcal</div>
                <div class="text-sm text-gray-600">基礎代謝量</div>
              </div>
            </div>
            
            <div class="p-3 bg-gray-50 rounded-lg">
              <div class="text-sm text-gray-700">
                <strong>BMI判定:</strong> {{ bmiCategory }}
              </div>
            </div>
          </div>
          
          <form @submit.prevent="nextStep" class="space-y-4">
            <div>
              <label for="goalType" class="block text-sm font-medium text-gray-700 mb-2">
                ダイエット目的
              </label>
              <div class="space-y-2">
                <label v-for="purpose in goalPurposes" :key="purpose.value" class="flex items-center">
                  <input
                    type="checkbox"
                    :value="purpose.value"
                    v-model="goalForm.purposes"
                    class="mr-2"
                  />
                  <span class="text-sm">{{ purpose.label }}</span>
                </label>
              </div>
            </div>
            
            <div>
              <label for="targetWeight" class="block text-sm font-medium text-gray-700 mb-2">
                目標体重 (kg)
              </label>
              <input
                id="targetWeight"
                v-model.number="goalForm.targetWeight"
                type="number"
                class="input-field"
                placeholder="例: 60.0"
                min="30"
                max="200"
                step="0.1"
                required
              />
              <p class="text-xs text-gray-500 mt-1">
                推奨範囲: {{ recommendedWeightRange }}
              </p>
            </div>
            
            <div>
              <label for="goalPeriod" class="block text-sm font-medium text-gray-700 mb-2">
                目標期間
              </label>
              <select
                id="goalPeriod"
                v-model="goalForm.goalPeriod"
                class="input-field"
                required
              >
                <option value="">選択してください</option>
                <option value="1">1ヶ月</option>
                <option value="3">3ヶ月</option>
                <option value="6">6ヶ月</option>
                <option value="12">1年</option>
              </select>
            </div>
            
            <div class="flex justify-between">
              <button type="button" @click="previousStep" class="btn-secondary">
                <i class="fas fa-arrow-left mr-2"></i>戻る
              </button>
              <button type="submit" class="btn-primary">
                次へ <i class="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          </form>
        </div>
      </section>

      <!-- Step 3: Calorie and PFC Goals -->
      <section v-if="currentStep === 3" class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">カロリー・栄養目標</h2>
          
          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-4">計算結果</h3>
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div class="text-center p-3 bg-blue-50 rounded-lg">
                <div class="text-lg font-bold text-blue-600">{{ calculatedTDEE }}kcal</div>
                <div class="text-sm text-gray-600">1日の消費カロリー</div>
              </div>
              <div class="text-center p-3 bg-green-50 rounded-lg">
                <div class="text-lg font-bold text-green-600">{{ calculatedTargetCalories }}kcal</div>
                <div class="text-sm text-gray-600">目標摂取カロリー</div>
              </div>
            </div>
            
            <div class="p-3 bg-yellow-50 rounded-lg">
              <div class="text-sm text-yellow-800">
                <strong>減量ペース:</strong> 週{{ weightLossPerWeek }}kg ({{ dailyCalorieDeficit }}kcal/日の不足)
              </div>
            </div>
          </div>
          
          <form @submit.prevent="nextStep" class="space-y-4">
            <div>
              <label for="targetCalories" class="block text-sm font-medium text-gray-700 mb-2">
                目標摂取カロリー (kcal/日)
              </label>
              <input
                id="targetCalories"
                v-model.number="goalForm.targetCalories"
                type="number"
                class="input-field"
                :placeholder="calculatedTargetCalories.toString()"
                min="800"
                max="4000"
                required
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                PFCバランス目標
              </label>
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label for="proteinRatio" class="block text-xs text-gray-600 mb-1">タンパク質 (%)</label>
                  <input
                    id="proteinRatio"
                    v-model.number="goalForm.proteinRatio"
                    type="number"
                    class="input-field text-sm"
                    placeholder="20"
                    min="10"
                    max="40"
                    required
                  />
                </div>
                <div>
                  <label for="fatRatio" class="block text-xs text-gray-600 mb-1">脂質 (%)</label>
                  <input
                    id="fatRatio"
                    v-model.number="goalForm.fatRatio"
                    type="number"
                    class="input-field text-sm"
                    placeholder="25"
                    min="10"
                    max="40"
                    required
                  />
                </div>
                <div>
                  <label for="carbsRatio" class="block text-xs text-gray-600 mb-1">炭水化物 (%)</label>
                  <input
                    id="carbsRatio"
                    v-model.number="goalForm.carbsRatio"
                    type="number"
                    class="input-field text-sm"
                    placeholder="55"
                    min="20"
                    max="70"
                    required
                  />
                </div>
              </div>
              
              <div v-if="pfcTotal !== 100" class="mt-2 p-2 bg-red-50 rounded text-sm text-red-600">
                PFCバランスの合計が100%になるように調整してください（現在: {{ pfcTotal }}%）
              </div>
            </div>
            
            <div class="flex justify-between">
              <button type="button" @click="previousStep" class="btn-secondary">
                <i class="fas fa-arrow-left mr-2"></i>戻る
              </button>
              <button type="submit" class="btn-primary" :disabled="pfcTotal !== 100">
                次へ <i class="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          </form>
        </div>
      </section>

      <!-- Step 4: Exercise Goals -->
      <section v-if="currentStep === 4" class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">運動目標</h2>
          
          <form @submit.prevent="nextStep" class="space-y-4">
            <div>
              <label for="exerciseFrequency" class="block text-sm font-medium text-gray-700 mb-2">
                週間運動頻度
              </label>
              <select
                id="exerciseFrequency"
                v-model="goalForm.exerciseFrequency"
                class="input-field"
                required
              >
                <option value="">選択してください</option>
                <option value="0">運動なし</option>
                <option value="1">週1回</option>
                <option value="2">週2回</option>
                <option value="3">週3回</option>
                <option value="4">週4回</option>
                <option value="5">週5回</option>
                <option value="6">週6回</option>
                <option value="7">毎日</option>
              </select>
            </div>
            
            <div>
              <label for="exerciseDuration" class="block text-sm font-medium text-gray-700 mb-2">
                1回の運動時間 (分)
              </label>
              <select
                id="exerciseDuration"
                v-model="goalForm.exerciseDuration"
                class="input-field"
                required
              >
                <option value="">選択してください</option>
                <option value="15">15分</option>
                <option value="30">30分</option>
                <option value="45">45分</option>
                <option value="60">60分</option>
                <option value="90">90分</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                運動タイプ
              </label>
              <div class="space-y-2">
                <label v-for="type in exerciseTypes" :key="type.value" class="flex items-center">
                  <input
                    type="checkbox"
                    :value="type.value"
                    v-model="goalForm.exerciseTypes"
                    class="mr-2"
                  />
                  <span class="text-sm">{{ type.label }}</span>
                </label>
              </div>
            </div>
            
            <div class="flex justify-between">
              <button type="button" @click="previousStep" class="btn-secondary">
                <i class="fas fa-arrow-left mr-2"></i>戻る
              </button>
              <button type="submit" class="btn-primary">
                次へ <i class="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          </form>
        </div>
      </section>

      <!-- Step 5: Review and Save -->
      <section v-if="currentStep === 5" class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">目標の確認</h2>
          
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-semibold mb-3">基本情報</h3>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>年齢: {{ goalForm.age }}歳</div>
                <div>性別: {{ genderLabel }}</div>
                <div>身長: {{ goalForm.height }}cm</div>
                <div>現在の体重: {{ goalForm.currentWeight }}kg</div>
                <div>活動レベル: {{ activityLevelLabel }}</div>
                <div>BMI: {{ calculatedBMI }}</div>
              </div>
            </div>
            
            <div>
              <h3 class="text-lg font-semibold mb-3">目標設定</h3>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>目標体重: {{ goalForm.targetWeight }}kg</div>
                <div>減量目標: {{ weightLossGoal }}kg</div>
                <div>目標期間: {{ goalForm.goalPeriod }}ヶ月</div>
                <div>目標カロリー: {{ goalForm.targetCalories }}kcal/日</div>
              </div>
            </div>
            
            <div>
              <h3 class="text-lg font-semibold mb-3">PFCバランス</h3>
              <div class="grid grid-cols-3 gap-4 text-sm">
                <div>タンパク質: {{ goalForm.proteinRatio }}%</div>
                <div>脂質: {{ goalForm.fatRatio }}%</div>
                <div>炭水化物: {{ goalForm.carbsRatio }}%</div>
              </div>
            </div>
            
            <div>
              <h3 class="text-lg font-semibold mb-3">運動目標</h3>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>週間頻度: {{ goalForm.exerciseFrequency }}回</div>
                <div>運動時間: {{ goalForm.exerciseDuration }}分</div>
              </div>
            </div>
          </div>
          
          <div class="flex justify-between mt-6">
            <button @click="previousStep" class="btn-secondary">
              <i class="fas fa-arrow-left mr-2"></i>戻る
            </button>
            <button @click="saveGoals" class="btn-primary">
              <i class="fas fa-save mr-2"></i>目標を保存
            </button>
          </div>
        </div>
      </section>
    </main>

    <!-- Bottom Navigation -->
    <BottomNavigation />

    <!-- Current Goals Modal -->
    <div v-if="showCurrentGoals" class="modal-overlay" @click="showCurrentGoals = false">
      <div class="modal-content max-h-screen overflow-y-auto" @click.stop>
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-semibold">現在の目標</h3>
          <button @click="showCurrentGoals = false" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-4">
          <div v-if="currentGoals" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="text-center p-3 bg-blue-50 rounded-lg">
                <div class="text-lg font-bold text-blue-600">{{ currentGoals.targetWeight }}kg</div>
                <div class="text-sm text-gray-600">目標体重</div>
              </div>
              <div class="text-center p-3 bg-green-50 rounded-lg">
                <div class="text-lg font-bold text-green-600">{{ currentGoals.targetCalories }}kcal</div>
                <div class="text-sm text-gray-600">目標カロリー</div>
              </div>
            </div>
            
            <div class="p-3 bg-gray-50 rounded-lg">
              <div class="text-sm text-gray-700">
                <strong>目標期間:</strong> {{ currentGoals.goalPeriod }}ヶ月<br>
                <strong>運動頻度:</strong> 週{{ currentGoals.exerciseFrequency }}回<br>
                <strong>運動時間:</strong> {{ currentGoals.exerciseDuration }}分
              </div>
            </div>
            
            <div class="flex space-x-3">
              <button @click="editGoals" class="flex-1 btn-secondary">
                <i class="fas fa-edit mr-2"></i>編集
              </button>
              <button @click="showCurrentGoals = false" class="flex-1 btn-primary">
                閉じる
              </button>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-gray-500">
            <i class="fas fa-bullseye text-3xl mb-2"></i>
            <p>目標が設定されていません</p>
            <p class="text-sm">目標設定を完了してください</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import BottomNavigation from '@/components/BottomNavigation.vue'

const router = useRouter()
const settingsStore = useSettingsStore()

// Reactive data
const isLoading = ref(false)
const currentStep = ref(1)
const totalSteps = 5
const showCurrentGoals = ref(false)
const currentGoals = ref(null)

// Form data
const goalForm = ref({
  age: null,
  gender: '',
  height: null,
  currentWeight: null,
  activityLevel: '',
  purposes: [],
  targetWeight: null,
  goalPeriod: '',
  targetCalories: null,
  proteinRatio: 20,
  fatRatio: 25,
  carbsRatio: 55,
  exerciseFrequency: '',
  exerciseDuration: '',
  exerciseTypes: []
})

// Constants
const goalPurposes = [
  { value: 'weight_loss', label: '体重を減らしたい' },
  { value: 'muscle_gain', label: '筋肉をつけたい' },
  { value: 'health', label: '健康維持' },
  { value: 'appearance', label: '見た目を改善したい' },
  { value: 'energy', label: '体力向上' }
]

const exerciseTypes = [
  { value: 'cardio', label: '有酸素運動（ウォーキング、ジョギング等）' },
  { value: 'strength', label: '筋力トレーニング' },
  { value: 'flexibility', label: 'ストレッチ・ヨガ' },
  { value: 'sports', label: 'スポーツ' },
  { value: 'dance', label: 'ダンス' }
]

// Steps configuration
const steps = computed(() => [
  { id: 1, description: '基本情報を入力してください', completed: currentStep.value > 1 },
  { id: 2, description: '目標を設定してください', completed: currentStep.value > 2 },
  { id: 3, description: 'カロリー・栄養目標を設定してください', completed: currentStep.value > 3 },
  { id: 4, description: '運動目標を設定してください', completed: currentStep.value > 4 },
  { id: 5, description: '設定内容を確認してください', completed: currentStep.value > 5 }
])

const currentStepIndex = computed(() => currentStep.value - 1)

// Computed properties
const calculatedBMI = computed(() => {
  if (!goalForm.value.height || !goalForm.value.currentWeight) return '---'
  const heightInMeters = goalForm.value.height / 100
  return (goalForm.value.currentWeight / (heightInMeters * heightInMeters)).toFixed(1)
})

const bmiCategory = computed(() => {
  const bmi = parseFloat(calculatedBMI.value)
  if (isNaN(bmi)) return '---'
  if (bmi < 18.5) return '低体重'
  if (bmi < 25) return '標準体重'
  if (bmi < 30) return '肥満（1度）'
  if (bmi < 35) return '肥満（2度）'
  return '肥満（3度）'
})

const calculatedBMR = computed(() => {
  if (!goalForm.value.age || !goalForm.value.gender || !goalForm.value.height || !goalForm.value.currentWeight) {
    return '---'
  }
  
  // Mifflin-St Jeor Equation
  let bmr = 10 * goalForm.value.currentWeight + 6.25 * goalForm.value.height - 5 * goalForm.value.age
  bmr = goalForm.value.gender === 'male' ? bmr + 5 : bmr - 161
  
  return Math.round(bmr)
})

const calculatedTDEE = computed(() => {
  const bmr = calculatedBMR.value
  if (bmr === '---') return '---'
  
  const activityMultipliers = {
    sedentary: 1.2,
    lightly: 1.375,
    moderately: 1.55,
    very: 1.725,
    extremely: 1.9
  }
  
  const multiplier = activityMultipliers[goalForm.value.activityLevel] || 1.2
  return Math.round(bmr * multiplier)
})

const calculatedTargetCalories = computed(() => {
  const tdee = calculatedTDEE.value
  if (tdee === '---') return '---'
  
  // 減量の場合は500kcal不足
  const weightLoss = goalForm.value.currentWeight - goalForm.value.targetWeight
  if (weightLoss > 0) {
    return Math.max(800, tdee - 500) // 最低800kcal
  }
  
  return tdee
})

const weightLossPerWeek = computed(() => {
  const deficit = calculatedTDEE.value - calculatedTargetCalories.value
  if (deficit === '---' || deficit <= 0) return '---'
  return (deficit * 7 / 7700).toFixed(1) // 7700kcal = 1kg
})

const dailyCalorieDeficit = computed(() => {
  const deficit = calculatedTDEE.value - calculatedTargetCalories.value
  return deficit === '---' ? '---' : deficit
})

const recommendedWeightRange = computed(() => {
  if (!goalForm.value.height) return '---'
  const heightInMeters = goalForm.value.height / 100
  const minWeight = Math.round(18.5 * heightInMeters * heightInMeters * 10) / 10
  const maxWeight = Math.round(24.9 * heightInMeters * heightInMeters * 10) / 10
  return `${minWeight}kg - ${maxWeight}kg`
})

const weightLossGoal = computed(() => {
  if (!goalForm.value.currentWeight || !goalForm.value.targetWeight) return '---'
  return (goalForm.value.currentWeight - goalForm.value.targetWeight).toFixed(1)
})

const pfcTotal = computed(() => {
  return (goalForm.value.proteinRatio || 0) + (goalForm.value.fatRatio || 0) + (goalForm.value.carbsRatio || 0)
})

const genderLabel = computed(() => {
  return goalForm.value.gender === 'male' ? '男性' : '女性'
})

const activityLevelLabel = computed(() => {
  const labels = {
    sedentary: '座り仕事中心',
    lightly: '軽い運動',
    moderately: '中程度の運動',
    very: '激しい運動',
    extremely: '非常に激しい運動'
  }
  return labels[goalForm.value.activityLevel] || '---'
})

// Methods
const getStepClass = (index) => {
  if (index < currentStep.value - 1) {
    return 'bg-green-500 text-white'
  } else if (index === currentStep.value - 1) {
    return 'bg-blue-500 text-white'
  } else {
    return 'bg-gray-200 text-gray-500'
  }
}

const getStepLineClass = (index) => {
  if (index < currentStep.value - 1) {
    return 'bg-green-500'
  } else {
    return 'bg-gray-200'
  }
}

const nextStep = () => {
  if (currentStep.value < totalSteps) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const saveGoals = async () => {
  try {
    isLoading.value = true
    
    const goals = {
      ...goalForm.value,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    await settingsStore.setGoals(goals)
    
    // 成功メッセージを表示
    alert('目標設定が完了しました！')
    
    // ホーム画面に戻る
    router.push('/home')
  } catch (error) {
    console.error('目標保存エラー:', error)
    alert('目標の保存に失敗しました。もう一度お試しください。')
  } finally {
    isLoading.value = false
  }
}

const resetGoals = () => {
  if (confirm('目標設定をリセットしますか？')) {
    goalForm.value = {
      age: null,
      gender: '',
      height: null,
      currentWeight: null,
      activityLevel: '',
      purposes: [],
      targetWeight: null,
      goalPeriod: '',
      targetCalories: null,
      proteinRatio: 20,
      fatRatio: 25,
      carbsRatio: 55,
      exerciseFrequency: '',
      exerciseDuration: '',
      exerciseTypes: []
    }
    currentStep.value = 1
  }
}

const editGoals = () => {
  if (currentGoals.value) {
    goalForm.value = { ...currentGoals.value }
    currentStep.value = 1
    showCurrentGoals.value = false
  }
}

const loadCurrentGoals = async () => {
  try {
    const goals = await settingsStore.getGoals()
    if (goals) {
      currentGoals.value = goals
      // 既存の目標がある場合は編集モードで開始
      goalForm.value = { ...goals }
    }
  } catch (error) {
    console.error('目標読み込みエラー:', error)
  }
}

// Lifecycle
onMounted(async () => {
  isLoading.value = true
  await loadCurrentGoals()
  isLoading.value = false
})

// Watchers
watch(() => goalForm.value.targetWeight, (newValue) => {
  if (newValue && calculatedTargetCalories.value !== '---') {
    goalForm.value.targetCalories = calculatedTargetCalories.value
  }
})
</script>

<style scoped>
.card {
  @apply bg-white rounded-lg shadow-sm p-6 mb-6;
}

.input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors;
}

.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-md w-full mx-4;
}
</style> 