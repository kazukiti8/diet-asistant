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
            <h1 class="text-xl font-bold">運動メニュー提案</h1>
          </div>
          <div class="flex space-x-2">
            <button @click="showFavoriteModal = true" class="p-2 text-gray-600 hover:text-gray-800">
              <i class="fas fa-heart text-xl"></i>
            </button>
            <button @click="showConditionModal = true" class="p-2 text-gray-600 hover:text-gray-800">
              <i class="fas fa-cog text-xl"></i>
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
      <!-- Condition Summary -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">現在の条件</h2>
          
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="text-center p-3 bg-blue-50 rounded-lg">
              <div class="text-lg font-bold text-blue-600">{{ userConditions.fitnessLevel }}</div>
              <div class="text-sm text-gray-600">体力レベル</div>
            </div>
            <div class="text-center p-3 bg-green-50 rounded-lg">
              <div class="text-lg font-bold text-green-600">{{ userConditions.availableTime }}分</div>
              <div class="text-sm text-gray-600">利用可能時間</div>
            </div>
            <div class="text-center p-3 bg-orange-50 rounded-lg">
              <div class="text-lg font-bold text-orange-600">{{ userConditions.targetMuscles.join(', ') || '全身' }}</div>
              <div class="text-sm text-gray-600">鍛えたい部位</div>
            </div>
            <div class="text-center p-3 bg-purple-50 rounded-lg">
              <div class="text-lg font-bold text-purple-600">{{ userConditions.equipment.join(', ') || 'なし' }}</div>
              <div class="text-sm text-gray-600">利用器具</div>
            </div>
          </div>
          
          <div class="text-center">
            <button @click="showConditionModal = true" class="btn-secondary">
              <i class="fas fa-edit mr-2"></i>条件を変更
            </button>
          </div>
        </div>
      </section>

      <!-- Recommended Menus -->
      <section class="mb-8">
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">おすすめメニュー</h2>
            <div class="flex space-x-2">
              <button @click="refreshRecommendations" class="text-blue-600 hover:text-blue-800 text-sm">
                <i class="fas fa-sync-alt mr-1"></i>更新
              </button>
            </div>
          </div>
          
          <div v-if="recommendedMenus.length > 0" class="space-y-4">
            <div
              v-for="menu in recommendedMenus"
              :key="menu.id"
              class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
              @click="viewMenu(menu)"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center mb-2">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                         :class="getExerciseTypeBg(menu.exerciseType)">
                      <i :class="getExerciseTypeIcon(menu.exerciseType)"></i>
                    </div>
                    <h3 class="text-lg font-semibold">{{ menu.name }}</h3>
                  </div>
                  
                  <p class="text-gray-600 text-sm mb-3">{{ menu.notes }}</p>
                  
                  <div class="grid grid-cols-3 gap-4 text-sm">
                    <div class="text-center">
                      <div class="font-bold text-blue-600">{{ menu.duration }}分</div>
                      <div class="text-gray-500">時間</div>
                    </div>
                    <div class="text-center">
                      <div class="font-bold text-green-600">{{ menu.caloriesBurned }}kcal</div>
                      <div class="text-gray-500">消費カロリー</div>
                    </div>
                    <div class="text-center">
                      <div class="font-bold text-orange-600">{{ getIntensityLabel(menu.intensity) }}</div>
                      <div class="text-gray-500">強度</div>
                    </div>
                  </div>
                  
                  <div class="mt-3">
                    <div class="text-xs text-gray-500 mb-1">鍛えられる部位:</div>
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="muscle in menu.targetMuscles"
                        :key="muscle"
                        class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {{ muscle }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div class="flex flex-col items-end space-y-2">
                  <button @click.stop="toggleFavorite(menu)" class="text-gray-400 hover:text-red-600">
                    <i :class="isFavorite(menu.id) ? 'fas fa-heart text-red-600' : 'far fa-heart'"></i>
                  </button>
                  <button @click.stop="startMenu(menu)" class="btn-primary text-sm">
                    <i class="fas fa-play mr-1"></i>開始
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-gray-500">
            <i class="fas fa-dumbbell text-3xl mb-2"></i>
            <p>条件に合うメニューが見つかりません</p>
            <button @click="showConditionModal = true" class="mt-2 text-blue-600 hover:text-blue-800">
              条件を変更する
            </button>
          </div>
        </div>
      </section>

      <!-- All Menus -->
      <section class="mb-8">
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">すべてのメニュー</h2>
            <div class="flex space-x-2">
              <select v-model="filterType" class="text-sm border border-gray-300 rounded px-2 py-1">
                <option value="">すべて</option>
                <option value="cardio">有酸素運動</option>
                <option value="strength">筋力トレーニング</option>
                <option value="flexibility">ストレッチ・柔軟</option>
                <option value="sports">スポーツ</option>
              </select>
            </div>
          </div>
          
          <div v-if="filteredMenus.length > 0" class="space-y-3">
            <div
              v-for="menu in filteredMenus"
              :key="menu.id"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              @click="viewMenu(menu)"
            >
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                     :class="getExerciseTypeBg(menu.exerciseType)">
                  <i :class="getExerciseTypeIcon(menu.exerciseType)"></i>
                </div>
                <div>
                  <p class="font-medium">{{ menu.name }}</p>
                  <p class="text-sm text-gray-600">{{ menu.notes }}</p>
                  <p class="text-xs text-gray-500">{{ menu.duration }}分 / {{ menu.caloriesBurned }}kcal</p>
                </div>
              </div>
              <div class="text-right">
                <button @click.stop="toggleFavorite(menu)" class="text-gray-400 hover:text-red-600 mr-2">
                  <i :class="isFavorite(menu.id) ? 'fas fa-heart text-red-600' : 'far fa-heart'"></i>
                </button>
                <i class="fas fa-chevron-right text-gray-400"></i>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-gray-500">
            <i class="fas fa-clipboard-list text-3xl mb-2"></i>
            <p>メニューがありません</p>
          </div>
        </div>
      </section>
    </main>

    <!-- Bottom Navigation -->
    <BottomNavigation />

    <!-- Condition Input Modal -->
    <div v-if="showConditionModal" class="modal-overlay" @click="showConditionModal = false">
      <div class="modal-content max-h-screen overflow-y-auto" @click.stop>
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-semibold">運動条件を設定</h3>
          <button @click="showConditionModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-4">
          <form @submit.prevent="saveConditions">
            <div class="mb-4">
              <label for="fitnessLevel" class="block text-sm font-medium text-gray-700 mb-2">
                体力レベル
              </label>
              <select
                id="fitnessLevel"
                v-model="conditionForm.fitnessLevel"
                class="input-field"
                required
              >
                <option value="">選択してください</option>
                <option value="beginner">初心者</option>
                <option value="intermediate">中級者</option>
                <option value="advanced">上級者</option>
              </select>
            </div>
            
            <div class="mb-4">
              <label for="availableTime" class="block text-sm font-medium text-gray-700 mb-2">
                利用可能時間 (分)
              </label>
              <input
                id="availableTime"
                v-model.number="conditionForm.availableTime"
                type="number"
                class="input-field"
                placeholder="例: 30"
                min="10"
                max="120"
                required
              />
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                鍛えたい部位
              </label>
              <div class="grid grid-cols-2 gap-2">
                <label v-for="muscle in muscleOptions" :key="muscle" class="flex items-center">
                  <input
                    type="checkbox"
                    :value="muscle"
                    v-model="conditionForm.targetMuscles"
                    class="mr-2"
                  />
                  <span class="text-sm">{{ muscle }}</span>
                </label>
              </div>
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                利用可能な器具
              </label>
              <div class="grid grid-cols-2 gap-2">
                <label v-for="equipment in equipmentOptions" :key="equipment" class="flex items-center">
                  <input
                    type="checkbox"
                    :value="equipment"
                    v-model="conditionForm.equipment"
                    class="mr-2"
                  />
                  <span class="text-sm">{{ equipment }}</span>
                </label>
              </div>
            </div>
            
            <div class="mb-4">
              <label for="preferredIntensity" class="block text-sm font-medium text-gray-700 mb-2">
                希望する強度
              </label>
              <select
                id="preferredIntensity"
                v-model="conditionForm.preferredIntensity"
                class="input-field"
                required
              >
                <option value="">選択してください</option>
                <option value="low">低（ゆっくり）</option>
                <option value="medium">中（普通）</option>
                <option value="high">高（激しい）</option>
              </select>
            </div>
            
            <div class="flex space-x-3">
              <button type="submit" class="flex-1 btn-primary">
                保存
              </button>
              <button type="button" @click="showConditionModal = false" class="flex-1 btn-secondary">
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Menu Detail Modal -->
    <div v-if="showDetailModal" class="modal-overlay" @click="showDetailModal = false">
      <div class="modal-content max-h-screen overflow-y-auto" @click.stop>
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-semibold">メニュー詳細</h3>
          <button @click="showDetailModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-4">
          <div v-if="selectedMenu" class="space-y-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600 mb-2">{{ selectedMenu.name }}</div>
              <p class="text-gray-600">{{ selectedMenu.notes }}</p>
            </div>
            
            <div class="grid grid-cols-3 gap-4">
              <div class="text-center p-3 bg-blue-50 rounded-lg">
                <div class="text-lg font-bold text-blue-600">{{ selectedMenu.duration }}分</div>
                <div class="text-sm text-gray-600">時間</div>
              </div>
              <div class="text-center p-3 bg-green-50 rounded-lg">
                <div class="text-lg font-bold text-green-600">{{ selectedMenu.caloriesBurned }}kcal</div>
                <div class="text-sm text-gray-600">消費カロリー</div>
              </div>
              <div class="text-center p-3 bg-orange-50 rounded-lg">
                <div class="text-lg font-bold text-orange-600">{{ getIntensityLabel(selectedMenu.intensity) }}</div>
                <div class="text-sm text-gray-600">強度</div>
              </div>
            </div>
            
            <div class="p-3 bg-gray-50 rounded-lg">
              <div class="text-sm font-medium text-gray-700 mb-2">鍛えられる部位:</div>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="muscle in selectedMenu.targetMuscles"
                  :key="muscle"
                  class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                >
                  {{ muscle }}
                </span>
              </div>
            </div>
            
            <div class="p-3 bg-gray-50 rounded-lg">
              <div class="text-sm font-medium text-gray-700 mb-2">運動内容:</div>
              <div class="space-y-2">
                <div
                  v-for="(exercise, index) in selectedMenu.exercises"
                  :key="index"
                  class="flex justify-between items-center p-2 bg-white rounded"
                >
                  <div>
                    <div class="font-medium">{{ exercise.name }}</div>
                    <div class="text-sm text-gray-600">
                      <span v-if="exercise.sets">{{ exercise.sets }}セット</span>
                      <span v-if="exercise.reps">{{ exercise.reps }}回</span>
                      <span v-if="exercise.duration">{{ exercise.duration }}秒</span>
                    </div>
                  </div>
                  <div class="text-sm text-gray-500">
                    <span v-if="exercise.rest">休憩{{ exercise.rest }}秒</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex space-x-3 mt-6">
            <button @click="startMenu(selectedMenu)" class="flex-1 btn-primary">
              <i class="fas fa-play mr-2"></i>運動を開始
            </button>
            <button @click="toggleFavorite(selectedMenu)" class="flex-1 btn-secondary">
              <i :class="isFavorite(selectedMenu?.id) ? 'fas fa-heart' : 'far fa-heart'" class="mr-2"></i>
              {{ isFavorite(selectedMenu?.id) ? 'お気に入り解除' : 'お気に入り追加' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Favorite Modal -->
    <div v-if="showFavoriteModal" class="modal-overlay" @click="showFavoriteModal = false">
      <div class="modal-content max-h-96 overflow-y-auto" @click.stop>
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-semibold">お気に入りメニュー</h3>
          <button @click="showFavoriteModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-4">
          <div v-if="favoriteMenus.length > 0" class="space-y-3">
            <div
              v-for="menu in favoriteMenus"
              :key="menu.id"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              @click="viewMenu(menu)"
            >
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-3">
                  <i class="fas fa-heart"></i>
                </div>
                <div>
                  <p class="font-medium">{{ menu.name }}</p>
                  <p class="text-sm text-gray-600">{{ menu.notes }}</p>
                  <p class="text-xs text-gray-500">{{ menu.duration }}分 / {{ menu.caloriesBurned }}kcal</p>
                </div>
              </div>
              <div class="text-right">
                <button @click.stop="removeFavoriteMenu(menu.id)" class="text-red-600 hover:text-red-800">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-gray-500">
            <i class="fas fa-heart text-3xl mb-2"></i>
            <p>お気に入りメニューがありません</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useExerciseStore } from '@/stores/exercise'
import BottomNavigation from '@/components/BottomNavigation.vue'

const router = useRouter()
const exerciseStore = useExerciseStore()

// リアクティブな状態
const isLoading = ref(true)
const showConditionModal = ref(false)
const showDetailModal = ref(false)
const showFavoriteModal = ref(false)
const selectedMenu = ref(null)
const filterType = ref('')

// 条件フォーム
const conditionForm = ref({
  fitnessLevel: 'beginner',
  availableTime: 30,
  targetMuscles: ['全身'],
  equipment: [],
  preferredIntensity: 'medium'
})

// オプション
const muscleOptions = [
  '全身', '上半身', '下半身', '腹筋', '背筋', '胸筋', '腕', '肩', '脚', 'お尻'
]

const equipmentOptions = [
  'ダンベル', 'バーベル', 'マット', 'ヨガマット', 'ストレッチポール', 'バランスボール', 'チューブ', 'なし'
]

// ユーザー条件（表示用）
const userConditions = computed(() => {
  const levelLabels = {
    beginner: '初心者',
    intermediate: '中級者',
    advanced: '上級者'
  }
  
  return {
    fitnessLevel: levelLabels[conditionForm.value.fitnessLevel] || '初心者',
    availableTime: conditionForm.value.availableTime,
    targetMuscles: conditionForm.value.targetMuscles,
    equipment: conditionForm.value.equipment
  }
})

// お気に入りメニュー
const favoriteMenus = computed(() => exerciseStore.favoriteMenus)

// フィルタリングされたメニュー
const filteredMenus = computed(() => {
  let menus = exerciseStore.exerciseMenus
  
  if (filterType.value) {
    menus = menus.filter(menu => menu.exerciseType === filterType.value)
  }
  
  return menus
})

// おすすめメニュー
const recommendedMenus = computed(() => {
  const allMenus = exerciseStore.exerciseMenus
  const conditions = conditionForm.value
  
  // 条件に基づいてスコアリング
  const scoredMenus = allMenus.map(menu => {
    let score = 0
    
    // 時間の適合性
    if (menu.duration <= conditions.availableTime) {
      score += 10
    } else if (menu.duration <= conditions.availableTime + 10) {
      score += 5
    }
    
    // 強度の適合性
    if (menu.intensity === conditions.preferredIntensity) {
      score += 8
    } else if (
      (conditions.preferredIntensity === 'medium' && 
       (menu.intensity === 'low' || menu.intensity === 'high')) ||
      (conditions.preferredIntensity === 'low' && menu.intensity === 'low') ||
      (conditions.preferredIntensity === 'high' && menu.intensity === 'high')
    ) {
      score += 4
    }
    
    // 体力レベルの適合性
    if (conditions.fitnessLevel === 'beginner' && menu.intensity === 'low') {
      score += 6
    } else if (conditions.fitnessLevel === 'intermediate' && menu.intensity === 'medium') {
      score += 6
    } else if (conditions.fitnessLevel === 'advanced' && menu.intensity === 'high') {
      score += 6
    }
    
    // ターゲット筋肉の適合性
    if (menu.targetMuscles && conditions.targetMuscles.length > 0) {
      const matchCount = menu.targetMuscles.filter(muscle => 
        conditions.targetMuscles.includes(muscle)
      ).length
      score += matchCount * 3
    }
    
    // 器具の適合性
    if (conditions.equipment.includes('なし') && (!menu.equipment || menu.equipment.length === 0)) {
      score += 5
    } else if (menu.equipment && conditions.equipment.length > 0) {
      const matchCount = menu.equipment.filter(equipment => 
        conditions.equipment.includes(equipment)
      ).length
      score += matchCount * 2
    }
    
    return { ...menu, score }
  })
  
  // スコアでソートして上位5つを返す
  return scoredMenus
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
})

// メソッド
const loadConditions = () => {
  const saved = localStorage.getItem('exerciseConditions')
  if (saved) {
    try {
      conditionForm.value = { ...conditionForm.value, ...JSON.parse(saved) }
    } catch (error) {
      console.error('条件の読み込みエラー:', error)
    }
  }
}

const saveConditions = () => {
  try {
    localStorage.setItem('exerciseConditions', JSON.stringify(conditionForm.value))
    showConditionModal.value = false
    
    if (window.$notify) {
      window.$notify.success('保存完了', '運動条件を保存しました')
    }
  } catch (error) {
    console.error('条件の保存エラー:', error)
    if (window.$notify) {
      window.$notify.error('エラー', '条件の保存に失敗しました')
    }
  }
}

const refreshRecommendations = () => {
  // おすすめメニューを再計算
  if (window.$notify) {
    window.$notify.info('更新完了', 'おすすめメニューを更新しました')
  }
}

const viewMenu = (menu) => {
  selectedMenu.value = menu
  showDetailModal.value = true
}

const isFavorite = (menuId) => {
  return favoriteMenus.value.some(menu => menu.id === menuId)
}

const toggleFavorite = async (menu) => {
  try {
    if (isFavorite(menu.id)) {
      await exerciseStore.removeFavoriteMenu(menu.id)
    } else {
      await exerciseStore.addFavoriteMenu(menu)
    }
  } catch (error) {
    console.error('お気に入り操作エラー:', error)
  }
}

const removeFavoriteMenu = async (menuId) => {
  try {
    await exerciseStore.removeFavoriteMenu(menuId)
  } catch (error) {
    console.error('お気に入り削除エラー:', error)
  }
}

const startMenu = (menu) => {
  // 運動記録画面に遷移してメニューを開始
  router.push({
    path: '/exercise-record',
    query: { 
      menuId: menu.id,
      menuName: menu.name,
      autoStart: 'true'
    }
  })
}

const getExerciseTypeBg = (type) => {
  const bgClasses = {
    cardio: 'bg-red-100 text-red-600',
    strength: 'bg-blue-100 text-blue-600',
    flexibility: 'bg-green-100 text-green-600',
    sports: 'bg-purple-100 text-purple-600'
  }
  return bgClasses[type] || 'bg-gray-100 text-gray-600'
}

const getExerciseTypeIcon = (type) => {
  const icons = {
    cardio: 'fas fa-running',
    strength: 'fas fa-dumbbell',
    flexibility: 'fas fa-child',
    sports: 'fas fa-futbol'
  }
  return icons[type] || 'fas fa-dumbbell'
}

const getIntensityLabel = (intensity) => {
  const labels = {
    low: '低',
    medium: '中',
    high: '高'
  }
  return labels[intensity] || '中'
}

// 初期化
onMounted(async () => {
  try {
    await exerciseStore.loadData()
    loadConditions()
    
    // デフォルトメニューがない場合は初期化
    if (exerciseStore.exerciseMenus.length === 0) {
      exerciseStore.initializeDefaultMenus()
    }
  } catch (error) {
    console.error('データ読み込みエラー:', error)
  } finally {
    isLoading.value = false
  }
})

// 条件変更時の監視
watch(conditionForm, () => {
  // 条件が変更されたら自動保存
  localStorage.setItem('exerciseConditions', JSON.stringify(conditionForm.value))
}, { deep: true })
</script> 