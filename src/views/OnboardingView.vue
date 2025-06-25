<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">ようこそ！</h1>
          </div>
          <div class="text-sm text-gray-500">
            {{ currentStep }}/{{ totalSteps }}
          </div>
        </div>
      </div>
    </header>

    <!-- Progress Bar -->
    <div class="bg-white border-b">
      <div class="container mx-auto px-4 py-2">
        <div class="flex items-center space-x-2">
          <div
            v-for="(step, index) in steps"
            :key="step.id"
            class="flex-1 flex items-center"
          >
            <div
              class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition"
              :class="getStepClass(index)"
            >
              <i v-if="step.completed" class="fas fa-check text-xs"></i>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div
              v-if="index < steps.length - 1"
              class="flex-1 h-1 mx-2 transition"
              :class="getStepLineClass(index)"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <!-- Welcome Step -->
      <div v-if="currentStep === 1" class="max-w-md mx-auto">
        <div class="text-center mb-8">
          <div class="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-heart text-white text-3xl"></i>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">ダイエット応援ノートへようこそ！</h2>
          <p class="text-gray-600 mb-6">
            あなたのダイエットをサポートするために、まずは基本情報を教えてください。
          </p>
        </div>
        
        <div class="card">
          <div class="space-y-4">
            <div class="flex items-center p-3 bg-blue-50 rounded-lg">
              <i class="fas fa-info-circle text-blue-600 mr-3"></i>
              <div class="text-sm text-blue-800">
                この情報はあなたのダイエット目標を設定するために使用されます
              </div>
            </div>
            
            <button @click="nextStep" class="w-full btn-primary py-3">
              始める <i class="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Profile Step -->
      <div v-if="currentStep === 2" class="max-w-md mx-auto">
        <div class="text-center mb-6">
          <h2 class="text-xl font-bold text-gray-900 mb-2">プロフィール設定</h2>
          <p class="text-gray-600">あなたの基本情報を教えてください</p>
        </div>
        
        <div class="card">
          <form class="space-y-4">
            <div>
              <label for="nickname" class="block text-sm font-medium text-gray-700 mb-2">
                ニックネーム
              </label>
              <input
                id="nickname"
                v-model="profileForm.nickname"
                type="text"
                class="input-field"
                placeholder="例: 田中太郎"
                required
              />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="age" class="block text-sm font-medium text-gray-700 mb-2">
                  年齢
                </label>
                <input
                  id="age"
                  v-model.number="profileForm.age"
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
                  v-model="profileForm.gender"
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
                  v-model.number="profileForm.height"
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
                  v-model.number="profileForm.currentWeight"
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
                v-model="profileForm.activityLevel"
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
            
            <div class="flex space-x-3">
              <button type="button" @click="prevStep" class="flex-1 btn-secondary" :disabled="isCompleting">
                戻る
              </button>
              <button type="submit" class="flex-1 btn-primary">
                次へ <i class="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Goals Step -->
      <div v-if="currentStep === 3" class="max-w-md mx-auto">
        <div class="text-center mb-6">
          <h2 class="text-xl font-bold text-gray-900 mb-2">目標設定</h2>
          <p class="text-gray-600">あなたのダイエット目標を設定しましょう</p>
        </div>
        
        <div class="card">
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
          
          <form class="space-y-4">
            <div>
              <label for="goalType" class="block text-sm font-medium text-gray-700 mb-2">
                ダイエット目的
              </label>
              <select
                id="goalType"
                v-model="goalsForm.goalType"
                class="input-field"
                required
              >
                <option value="">選択してください</option>
                <option value="weight_loss">体重を減らしたい</option>
                <option value="weight_gain">体重を増やしたい</option>
                <option value="maintenance">体重を維持したい</option>
                <option value="muscle_gain">筋肉をつけたい</option>
              </select>
            </div>
            
            <div v-if="goalsForm.goalType === 'weight_loss' || goalsForm.goalType === 'weight_gain'">
              <label for="targetWeight" class="block text-sm font-medium text-gray-700 mb-2">
                目標体重 (kg)
              </label>
              <input
                id="targetWeight"
                v-model.number="goalsForm.targetWeight"
                type="number"
                class="input-field"
                placeholder="例: 60.0"
                min="30"
                max="200"
                step="0.1"
                required
              />
            </div>
            
            <div>
              <label for="weeklyGoal" class="block text-sm font-medium text-gray-700 mb-2">
                週間目標
              </label>
              <select
                id="weeklyGoal"
                v-model="goalsForm.weeklyGoal"
                class="input-field"
                required
              >
                <option value="">選択してください</option>
                <option value="0.25">0.25kg/週（ゆっくり）</option>
                <option value="0.5">0.5kg/週（標準）</option>
                <option value="0.75">0.75kg/週（積極的）</option>
                <option value="1.0">1.0kg/週（最大）</option>
              </select>
            </div>
            
            <div>
              <label for="dailyCalories" class="block text-sm font-medium text-gray-700 mb-2">
                1日の目標カロリー
              </label>
              <input
                id="dailyCalories"
                v-model.number="goalsForm.dailyCalories"
                type="number"
                class="input-field"
                placeholder="例: 1800"
                min="1000"
                max="4000"
                step="50"
                required
              />
              <p class="text-xs text-gray-500 mt-1">
                推奨: {{ recommendedCalories }}kcal
              </p>
            </div>
            
            <div class="flex space-x-3">
              <button type="button" @click="prevStep" class="flex-1 btn-secondary" :disabled="isCompleting">
                戻る
              </button>
              <button type="button" @click="handleComplete" class="flex-1 btn-primary" :disabled="isCompleting">
                <span v-if="isCompleting">
                  <i class="fas fa-spinner fa-spin mr-2"></i>処理中...
                </span>
                <span v-else>
                  完了 <i class="fas fa-check ml-2"></i>
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'

const router = useRouter()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()

// ステップ管理
const currentStep = ref(1)
const totalSteps = 3
const isCompleting = ref(false)

const steps = computed(() => [
  { id: 'welcome', completed: currentStep.value > 1, description: 'ようこそ' },
  { id: 'profile', completed: currentStep.value > 2, description: 'プロフィール' },
  { id: 'goals', completed: currentStep.value > 3, description: '目標設定' }
])

// フォームデータ
const profileForm = reactive({
  nickname: '',
  age: null,
  gender: '',
  height: null,
  currentWeight: null,
  activityLevel: ''
})

const goalsForm = reactive({
  goalType: '',
  targetWeight: null,
  weeklyGoal: '0.5',
  dailyCalories: 2000
})

// 計算プロパティ
const calculatedBMI = computed(() => {
  if (!profileForm.height || !profileForm.currentWeight) return '--'
  const heightInMeters = profileForm.height / 100
  const bmi = profileForm.currentWeight / (heightInMeters * heightInMeters)
  return bmi.toFixed(1)
})

const bmiCategory = computed(() => {
  const bmi = parseFloat(calculatedBMI.value)
  if (isNaN(bmi)) return '--'
  
  if (bmi < 18.5) return '低体重'
  if (bmi < 25) return '普通体重'
  if (bmi < 30) return '肥満（1度）'
  return '肥満（2度以上）'
})

const calculatedBMR = computed(() => {
  if (!profileForm.age || !profileForm.gender || !profileForm.height || !profileForm.currentWeight) {
    return '--'
  }
  
  // ハリス・ベネディクト方程式
  let bmr
  if (profileForm.gender === 'male') {
    bmr = 88.362 + (13.397 * profileForm.currentWeight) + (4.799 * profileForm.height) - (5.677 * profileForm.age)
  } else {
    bmr = 447.593 + (9.247 * profileForm.currentWeight) + (3.098 * profileForm.height) - (4.330 * profileForm.age)
  }
  
  return Math.round(bmr)
})

const recommendedCalories = computed(() => {
  const bmr = calculatedBMR.value
  if (bmr === '--') return 2000
  
  // 活動レベルによる係数
  const activityMultipliers = {
    sedentary: 1.2,
    lightly: 1.375,
    moderately: 1.55,
    very: 1.725,
    extremely: 1.9
  }
  
  const multiplier = activityMultipliers[profileForm.activityLevel] || 1.2
  const tdee = bmr * multiplier
  
  // 目標に応じて調整
  if (goalsForm.goalType === 'weight_loss') {
    return Math.round(tdee - 500) // 週0.5kg減量
  } else if (goalsForm.goalType === 'weight_gain') {
    return Math.round(tdee + 500) // 週0.5kg増量
  } else {
    return Math.round(tdee) // 維持
  }
})

// メソッド
const getStepClass = (index) => {
  if (index < currentStep.value - 1) {
    return 'bg-green-500 text-white'
  } else if (index === currentStep.value - 1) {
    return 'bg-primary-600 text-white'
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

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const completeOnboarding = async () => {
  console.log('オンボーディング完了処理を開始します')
  
  try {
    // プロフィール設定を保存
    const profileSettings = {
      nickname: profileForm.nickname,
      age: profileForm.age,
      gender: profileForm.gender,
      height: profileForm.height,
      currentWeight: profileForm.currentWeight,
      activityLevel: profileForm.activityLevel
    }
    
    console.log('プロフィール設定を保存中:', profileSettings)
    await settingsStore.updateSettings(profileSettings)
    
    // 目標設定を保存
    const goalSettings = {
      targetWeight: goalsForm.targetWeight,
      dailyCalorieGoal: goalsForm.dailyCalories,
      weeklyWeightLoss: parseFloat(goalsForm.weeklyGoal),
      goalType: goalsForm.goalType
    }
    
    console.log('目標設定を保存中:', goalSettings)
    await settingsStore.updateSettings(goalSettings)
    
    // オンボーディング完了フラグを設定
    console.log('オンボーディング完了フラグを設定中')
    await authStore.completeOnboarding()
    
    // 状態更新の確認
    console.log('オンボーディング完了後の状態確認:')
    console.log('- isFirstLogin:', authStore.isFirstLogin)
    console.log('- needsOnboarding:', authStore.needsOnboarding)
    
    // 念のため、needsOnboardingを直接強制的に更新
    if (authStore.needsOnboarding) {
      console.log('needsOnboardingがまだtrueのため、強制的にfalseに設定')
      authStore.needsOnboarding = false
    }
    
    // 状態更新のため少し待機
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 再度状態を確認
    console.log('待機後の状態確認:')
    console.log('- isFirstLogin:', authStore.isFirstLogin)
    console.log('- needsOnboarding:', authStore.needsOnboarding)
    
    // 最終確認：needsOnboardingがfalseになっているかチェック
    if (authStore.needsOnboarding) {
      console.log('最終確認：needsOnboardingがまだtrueのため、再度falseに設定')
      authStore.needsOnboarding = false
    }
    
    // ホーム画面に遷移
    console.log('ホーム画面に遷移します')
    await router.push('/home')
    
    console.log('オンボーディング完了処理が正常に完了しました')
    
    if (window.$notify) {
      window.$notify.success('設定完了', 'プロフィールと目標設定が完了しました！')
    }
  } catch (error) {
    console.error('オンボーディング完了エラー:', error)
    if (window.$notify) {
      window.$notify.error('エラー', '設定の保存に失敗しました')
    }
  } finally {
    isCompleting.value = false
  }
}

const handleComplete = () => {
  // バリデーション
  if (!goalsForm.goalType) {
    if (window.$notify) {
      window.$notify.error('エラー', 'ダイエット目的を選択してください')
    }
    return
  }
  
  if ((goalsForm.goalType === 'weight_loss' || goalsForm.goalType === 'weight_gain') && !goalsForm.targetWeight) {
    if (window.$notify) {
      window.$notify.error('エラー', '目標体重を入力してください')
    }
    return
  }
  
  if (!goalsForm.weeklyGoal) {
    if (window.$notify) {
      window.$notify.error('エラー', '週間目標を選択してください')
    }
    return
  }
  
  if (!goalsForm.dailyCalories) {
    if (window.$notify) {
      window.$notify.error('エラー', '1日の目標カロリーを入力してください')
    }
    return
  }
  
  // ローディング状態を開始
  isCompleting.value = true
  
  // バリデーション通過後、オンボーディング完了処理を実行
  completeOnboarding()
}

// 初期化
onMounted(() => {
  // 既存の設定があれば読み込み
  const existingSettings = settingsStore.userSettings
  if (existingSettings.nickname) {
    profileForm.nickname = existingSettings.nickname
  }
  if (existingSettings.age) {
    profileForm.age = existingSettings.age
  }
  if (existingSettings.gender) {
    profileForm.gender = existingSettings.gender
  }
  if (existingSettings.height) {
    profileForm.height = existingSettings.height
  }
  if (existingSettings.currentWeight) {
    profileForm.currentWeight = existingSettings.currentWeight
  }
  if (existingSettings.activityLevel) {
    profileForm.activityLevel = existingSettings.activityLevel
  }
  if (existingSettings.targetWeight) {
    goalsForm.targetWeight = existingSettings.targetWeight
  }
  if (existingSettings.dailyCalorieGoal) {
    goalsForm.dailyCalories = existingSettings.dailyCalorieGoal
  }
})
</script> 