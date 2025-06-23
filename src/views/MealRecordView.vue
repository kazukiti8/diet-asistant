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
            <h1 class="text-xl font-bold">食事記録</h1>
          </div>
          <div class="flex space-x-2">
            <button @click="showMyMenuModal = true" class="p-2 text-gray-600 hover:text-gray-800">
              <i class="fas fa-bookmark text-xl"></i>
            </button>
            <button @click="showHistoryModal = true" class="p-2 text-gray-600 hover:text-gray-800">
              <i class="fas fa-history text-xl"></i>
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
      <!-- Today's Summary -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">今日の食事</h2>
          
          <div class="grid grid-cols-3 gap-4 mb-4">
            <div class="text-center p-3 bg-blue-50 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">{{ todaySummary.totalCalories }}</div>
              <div class="text-sm text-gray-600">総カロリー</div>
              <div class="text-xs text-blue-600">目標: {{ calorieGoal }}</div>
            </div>
            <div class="text-center p-3 bg-green-50 rounded-lg">
              <div class="text-2xl font-bold text-green-600">{{ todaySummary.mealCount }}</div>
              <div class="text-sm text-gray-600">食事回数</div>
            </div>
            <div class="text-center p-3 bg-orange-50 rounded-lg">
              <div class="text-2xl font-bold text-orange-600">{{ todaySummary.remaining }}</div>
              <div class="text-sm text-gray-600">残りカロリー</div>
            </div>
          </div>
          
          <div class="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              class="bg-blue-600 h-3 rounded-full transition-all duration-300"
              :style="{ width: Math.min((todaySummary.totalCalories / calorieGoal) * 100, 100) + '%' }"
            ></div>
          </div>
          
          <div class="text-center">
            <button @click="showInputModal = true" class="btn-primary">
              <i class="fas fa-plus mr-2"></i>食事を記録
            </button>
          </div>
        </div>
      </section>

      <!-- Today's Meals -->
      <section class="mb-8">
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">今日の食事</h2>
            <div class="flex space-x-2">
              <button @click="showTemplateModal = true" class="text-green-600 hover:text-green-800 text-sm">
                <i class="fas fa-clipboard-list mr-1"></i>テンプレート
              </button>
              <button @click="showInputModal = true" class="text-blue-600 hover:text-blue-800 text-sm">
                <i class="fas fa-plus mr-1"></i>追加
              </button>
            </div>
          </div>
          
          <div v-if="todayMeals.length > 0" class="space-y-3">
            <div
              v-for="meal in todayMeals"
              :key="meal.id"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              @click="viewMeal(meal)"
            >
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                     :class="getMealTypeBg(meal.mealType)">
                  <i :class="getMealTypeIcon(meal.mealType)"></i>
                </div>
                <div>
                  <p class="font-medium">{{ meal.name }}</p>
                  <p class="text-sm text-gray-600">{{ meal.notes || '詳細なし' }}</p>
                  <p class="text-xs text-gray-500">{{ formatTime(meal.timestamp) }}</p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-blue-600">{{ meal.calories }}kcal</div>
                <div class="text-xs text-gray-500">
                  P: {{ meal.protein }}g F: {{ meal.fat }}g C: {{ meal.carbs }}g
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-gray-500">
            <i class="fas fa-utensils text-3xl mb-2"></i>
            <p>今日の食事を記録しましょう</p>
            <button @click="showInputModal = true" class="mt-2 text-blue-600 hover:text-blue-800">
              最初の食事を記録
            </button>
          </div>
        </div>
      </section>

      <!-- Nutrition Balance -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">栄養バランス</h2>
          
          <div class="grid grid-cols-3 gap-4 mb-4">
            <div class="text-center p-3 bg-blue-50 rounded-lg">
              <div class="text-lg font-bold text-blue-600">{{ nutritionBalance.protein }}g</div>
              <div class="text-sm text-gray-600">タンパク質</div>
              <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div class="bg-blue-600 h-2 rounded-full" :style="{ width: nutritionProgress.protein + '%' }"></div>
              </div>
              <div class="text-xs text-gray-500">目標: {{ pfcGoals.protein }}g</div>
            </div>
            <div class="text-center p-3 bg-green-50 rounded-lg">
              <div class="text-lg font-bold text-green-600">{{ nutritionBalance.fat }}g</div>
              <div class="text-sm text-gray-600">脂質</div>
              <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div class="bg-green-600 h-2 rounded-full" :style="{ width: nutritionProgress.fat + '%' }"></div>
              </div>
              <div class="text-xs text-gray-500">目標: {{ pfcGoals.fat }}g</div>
            </div>
            <div class="text-center p-3 bg-orange-50 rounded-lg">
              <div class="text-lg font-bold text-orange-600">{{ nutritionBalance.carbs }}g</div>
              <div class="text-sm text-gray-600">炭水化物</div>
              <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div class="bg-orange-600 h-2 rounded-full" :style="{ width: nutritionProgress.carbs + '%' }"></div>
              </div>
              <div class="text-xs text-gray-500">目標: {{ pfcGoals.carbs }}g</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Recent Meals -->
      <section class="mb-8">
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">最近の食事</h2>
            <button @click="showHistoryModal = true" class="text-blue-600 hover:text-blue-800 text-sm">
              すべて見る
            </button>
          </div>
          
          <div v-if="recentMeals.length > 0" class="space-y-3">
            <div
              v-for="meal in recentMeals"
              :key="meal.id"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              @click="viewMeal(meal)"
            >
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                     :class="getMealTypeBg(meal.mealType)">
                  <i :class="getMealTypeIcon(meal.mealType)"></i>
                </div>
                <div>
                  <p class="font-medium">{{ meal.name }}</p>
                  <p class="text-sm text-gray-600">{{ meal.notes || '詳細なし' }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(meal.timestamp) }}</p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-blue-600">{{ meal.calories }}kcal</div>
                <i class="fas fa-chevron-right text-gray-400"></i>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-gray-500">
            <i class="fas fa-clipboard-list text-3xl mb-2"></i>
            <p>まだ記録がありません</p>
          </div>
        </div>
      </section>
    </main>

    <!-- Bottom Navigation -->
    <BottomNavigation />

    <!-- Meal Input Modal -->
    <div v-if="showInputModal" class="modal-overlay" @click="showInputModal = false">
      <div class="modal-content max-h-screen overflow-y-auto" @click.stop>
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-semibold">{{ editingMeal ? '食事を編集' : '食事を記録' }}</h3>
          <button @click="showInputModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-4">
          <form @submit.prevent="saveMeal">
            <div class="mb-4">
              <label for="mealType" class="block text-sm font-medium text-gray-700 mb-2">
                食事タイプ
              </label>
              <select
                id="mealType"
                v-model="mealForm.mealType"
                class="input-field"
                required
              >
                <option value="">選択してください</option>
                <option value="breakfast">朝食</option>
                <option value="lunch">昼食</option>
                <option value="dinner">夕食</option>
                <option value="snack">間食</option>
              </select>
            </div>
            
            <div class="mb-4">
              <label for="mealName" class="block text-sm font-medium text-gray-700 mb-2">
                食事名
              </label>
              <input
                id="mealName"
                v-model="mealForm.name"
                type="text"
                class="input-field"
                placeholder="例: 朝食、昼食、夕食"
                required
              />
            </div>
            
            <div class="mb-4">
              <label for="mealNotes" class="block text-sm font-medium text-gray-700 mb-2">
                内容・メモ
              </label>
              <textarea
                id="mealNotes"
                v-model="mealForm.notes"
                class="input-field"
                rows="3"
                placeholder="食べたものを記録"
              ></textarea>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label for="calories" class="block text-sm font-medium text-gray-700 mb-2">
                  カロリー (kcal)
                </label>
                <input
                  id="calories"
                  v-model.number="mealForm.calories"
                  type="number"
                  class="input-field"
                  placeholder="例: 350"
                  required
                />
              </div>
              <div>
                <label for="mealTime" class="block text-sm font-medium text-gray-700 mb-2">
                  時間
                </label>
                <input
                  id="mealTime"
                  v-model="mealForm.time"
                  type="time"
                  class="input-field"
                  required
                />
              </div>
            </div>
            
            <div class="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label for="protein" class="block text-sm font-medium text-gray-700 mb-2">
                  タンパク質 (g)
                </label>
                <input
                  id="protein"
                  v-model.number="mealForm.protein"
                  type="number"
                  class="input-field"
                  placeholder="例: 15"
                />
              </div>
              <div>
                <label for="fat" class="block text-sm font-medium text-gray-700 mb-2">
                  脂質 (g)
                </label>
                <input
                  id="fat"
                  v-model.number="mealForm.fat"
                  type="number"
                  class="input-field"
                  placeholder="例: 8"
                />
              </div>
              <div>
                <label for="carbs" class="block text-sm font-medium text-gray-700 mb-2">
                  炭水化物 (g)
                </label>
                <input
                  id="carbs"
                  v-model.number="mealForm.carbs"
                  type="number"
                  class="input-field"
                  placeholder="例: 45"
                />
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label for="fiber" class="block text-sm font-medium text-gray-700 mb-2">
                  食物繊維 (g)
                </label>
                <input
                  id="fiber"
                  v-model.number="mealForm.fiber"
                  type="number"
                  class="input-field"
                  placeholder="例: 5"
                />
              </div>
              <div>
                <label for="sodium" class="block text-sm font-medium text-gray-700 mb-2">
                  ナトリウム (mg)
                </label>
                <input
                  id="sodium"
                  v-model.number="mealForm.sodium"
                  type="number"
                  class="input-field"
                  placeholder="例: 800"
                />
              </div>
            </div>
            
            <div class="flex space-x-3">
              <button type="submit" class="flex-1 btn-primary">
                {{ editingMeal ? '更新' : '記録' }}
              </button>
              <button type="button" @click="showInputModal = false" class="flex-1 btn-secondary">
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- History Modal -->
    <div v-if="showHistoryModal" class="modal-overlay" @click="showHistoryModal = false">
      <div class="modal-content max-h-96 overflow-y-auto" @click.stop>
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-semibold">食事記録履歴</h3>
          <button @click="showHistoryModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-4">
          <div v-if="mealHistory.length > 0" class="space-y-3">
            <div
              v-for="meal in mealHistory"
              :key="meal.id"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              @click="viewMeal(meal)"
            >
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                     :class="getMealTypeBg(meal.mealType)">
                  <i :class="getMealTypeIcon(meal.mealType)"></i>
                </div>
                <div>
                  <p class="font-medium">{{ meal.name }}</p>
                  <p class="text-sm text-gray-600">{{ meal.notes || '詳細なし' }}</p>
                  <p class="text-xs text-gray-500">{{ formatDateTime(meal.timestamp) }}</p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-blue-600">{{ meal.calories }}kcal</div>
                <i class="fas fa-chevron-right text-gray-400"></i>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-gray-500">
            <i class="fas fa-clipboard-list text-3xl mb-2"></i>
            <p>まだ記録がありません</p>
          </div>
        </div>
      </div>
    </div>

    <!-- My Menu Modal -->
    <div v-if="showMyMenuModal" class="modal-overlay" @click="showMyMenuModal = false">
      <div class="modal-content max-h-96 overflow-y-auto" @click.stop>
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-semibold">マイメニュー</h3>
          <div class="flex space-x-2">
            <button @click="showAddMenuModal = true" class="text-blue-600 hover:text-blue-800 text-sm">
              <i class="fas fa-plus mr-1"></i>追加
            </button>
            <button @click="showMyMenuModal = false" class="text-gray-500 hover:text-gray-700">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        <div class="p-4">
          <div v-if="myMenus.length > 0" class="space-y-3">
            <div
              v-for="menu in myMenus"
              :key="menu.id"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              @click="useMyMenu(menu)"
            >
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                  <i class="fas fa-bookmark"></i>
                </div>
                <div>
                  <p class="font-medium">{{ menu.name }}</p>
                  <p class="text-sm text-gray-600">{{ menu.notes || '詳細なし' }}</p>
                  <p class="text-xs text-gray-500">{{ menu.calories }}kcal</p>
                </div>
              </div>
              <div class="text-right">
                <button @click.stop="deleteMyMenu(menu.id)" class="text-red-600 hover:text-red-800">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-gray-500">
            <i class="fas fa-bookmark text-3xl mb-2"></i>
            <p>マイメニューがありません</p>
            <button @click="showAddMenuModal = true" class="mt-2 text-blue-600 hover:text-blue-800">
              最初のメニューを追加
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Template Modal -->
    <div v-if="showTemplateModal" class="modal-overlay" @click="showTemplateModal = false">
      <div class="modal-content max-h-96 overflow-y-auto" @click.stop>
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-semibold">テンプレート</h3>
          <button @click="showTemplateModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-4">
          <div v-if="templates.length > 0" class="space-y-3">
            <div
              v-for="template in templates"
              :key="template.id"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              @click="useTemplate(template)"
            >
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3">
                  <i class="fas fa-clipboard-list"></i>
                </div>
                <div>
                  <p class="font-medium">{{ template.name }}</p>
                  <p class="text-sm text-gray-600">{{ template.notes || '詳細なし' }}</p>
                  <p class="text-xs text-gray-500">{{ template.calories }}kcal</p>
                </div>
              </div>
              <i class="fas fa-chevron-right text-gray-400"></i>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-gray-500">
            <i class="fas fa-clipboard-list text-3xl mb-2"></i>
            <p>テンプレートがありません</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Meal Detail Modal -->
    <div v-if="showDetailModal" class="modal-overlay" @click="showDetailModal = false">
      <div class="modal-content" @click.stop>
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-semibold">食事詳細</h3>
          <button @click="showDetailModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-4">
          <div v-if="selectedMeal" class="space-y-4">
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-600 mb-2">{{ selectedMeal.calories }}kcal</div>
              <p class="text-sm text-gray-600">{{ formatDateTime(selectedMeal.timestamp) }}</p>
            </div>
            
            <div class="grid grid-cols-3 gap-4">
              <div class="text-center p-3 bg-blue-50 rounded-lg">
                <div class="text-lg font-bold text-blue-600">{{ selectedMeal.protein }}g</div>
                <div class="text-sm text-gray-600">タンパク質</div>
              </div>
              <div class="text-center p-3 bg-green-50 rounded-lg">
                <div class="text-lg font-bold text-green-600">{{ selectedMeal.fat }}g</div>
                <div class="text-sm text-gray-600">脂質</div>
              </div>
              <div class="text-center p-3 bg-orange-50 rounded-lg">
                <div class="text-lg font-bold text-orange-600">{{ selectedMeal.carbs }}g</div>
                <div class="text-sm text-gray-600">炭水化物</div>
              </div>
            </div>
            
            <div v-if="selectedMeal.notes" class="p-3 bg-gray-50 rounded-lg">
              <div class="text-sm font-medium text-gray-700 mb-1">メモ</div>
              <div class="text-gray-600">{{ selectedMeal.notes }}</div>
            </div>
          </div>
          
          <div class="flex space-x-3 mt-6">
            <button @click="editMeal(selectedMeal)" class="flex-1 btn-secondary">
              <i class="fas fa-edit mr-2"></i>編集
            </button>
            <button @click="deleteMeal" class="flex-1 btn-danger">
              <i class="fas fa-trash mr-2"></i>削除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add My Menu Modal -->
    <div v-if="showAddMenuModal" class="modal-overlay" @click="showAddMenuModal = false">
      <div class="modal-content max-h-screen overflow-y-auto" @click.stop>
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-semibold">マイメニューを追加</h3>
          <button @click="showAddMenuModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-4">
          <form @submit.prevent="saveMyMenu">
            <div class="mb-4">
              <label for="menuName" class="block text-sm font-medium text-gray-700 mb-2">
                メニュー名
              </label>
              <input
                id="menuName"
                v-model="menuForm.name"
                type="text"
                class="input-field"
                placeholder="例: 朝食セット"
                required
              />
            </div>
            
            <div class="mb-4">
              <label for="menuNotes" class="block text-sm font-medium text-gray-700 mb-2">
                内容・メモ
              </label>
              <textarea
                id="menuNotes"
                v-model="menuForm.notes"
                class="input-field"
                rows="3"
                placeholder="メニューの内容を記録"
              ></textarea>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label for="menuCalories" class="block text-sm font-medium text-gray-700 mb-2">
                  カロリー (kcal)
                </label>
                <input
                  id="menuCalories"
                  v-model.number="menuForm.calories"
                  type="number"
                  class="input-field"
                  placeholder="例: 350"
                  required
                />
              </div>
              <div>
                <label for="menuType" class="block text-sm font-medium text-gray-700 mb-2">
                  食事タイプ
                </label>
                <select
                  id="menuType"
                  v-model="menuForm.mealType"
                  class="input-field"
                  required
                >
                  <option value="">選択してください</option>
                  <option value="breakfast">朝食</option>
                  <option value="lunch">昼食</option>
                  <option value="dinner">夕食</option>
                  <option value="snack">間食</option>
                </select>
              </div>
            </div>
            
            <div class="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label for="menuProtein" class="block text-sm font-medium text-gray-700 mb-2">
                  タンパク質 (g)
                </label>
                <input
                  id="menuProtein"
                  v-model.number="menuForm.protein"
                  type="number"
                  class="input-field"
                  placeholder="例: 15"
                />
              </div>
              <div>
                <label for="menuFat" class="block text-sm font-medium text-gray-700 mb-2">
                  脂質 (g)
                </label>
                <input
                  id="menuFat"
                  v-model.number="menuForm.fat"
                  type="number"
                  class="input-field"
                  placeholder="例: 8"
                />
              </div>
              <div>
                <label for="menuCarbs" class="block text-sm font-medium text-gray-700 mb-2">
                  炭水化物 (g)
                </label>
                <input
                  id="menuCarbs"
                  v-model.number="menuForm.carbs"
                  type="number"
                  class="input-field"
                  placeholder="例: 45"
                />
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label for="menuFiber" class="block text-sm font-medium text-gray-700 mb-2">
                  食物繊維 (g)
                </label>
                <input
                  id="menuFiber"
                  v-model.number="menuForm.fiber"
                  type="number"
                  class="input-field"
                  placeholder="例: 5"
                />
              </div>
              <div>
                <label for="menuSodium" class="block text-sm font-medium text-gray-700 mb-2">
                  ナトリウム (mg)
                </label>
                <input
                  id="menuSodium"
                  v-model.number="menuForm.sodium"
                  type="number"
                  class="input-field"
                  placeholder="例: 800"
                />
              </div>
            </div>
            
            <div class="flex space-x-3">
              <button type="submit" class="flex-1 btn-primary">
                保存
              </button>
              <button type="button" @click="showAddMenuModal = false" class="flex-1 btn-secondary">
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useMealStore } from '@/stores/meal'
import { useSettingsStore } from '@/stores/settings'
import BottomNavigation from '@/components/BottomNavigation.vue'

// ストアの初期化
const mealStore = useMealStore()
const settingsStore = useSettingsStore()

// リアクティブデータ
const showInputModal = ref(false)
const showHistoryModal = ref(false)
const showDetailModal = ref(false)
const showMyMenuModal = ref(false)
const showTemplateModal = ref(false)
const showAddMenuModal = ref(false)
const isLoading = ref(true)
const editingMeal = ref(null)
const selectedMeal = ref(null)

// 食事フォーム
const mealForm = reactive({
  mealType: '',
  name: '',
  notes: '',
  calories: '',
  protein: '',
  fat: '',
  carbs: '',
  fiber: '',
  sodium: '',
  time: ''
})

// マイメニューフォーム
const menuForm = reactive({
  name: '',
  notes: '',
  calories: '',
  mealType: '',
  protein: '',
  fat: '',
  carbs: '',
  fiber: '',
  sodium: ''
})

// カロリー目標とPFC目標
const calorieGoal = computed(() => settingsStore.calorieGoal || 1500)
const pfcGoals = computed(() => ({
  protein: settingsStore.proteinGoal || 60,
  fat: settingsStore.fatGoal || 50,
  carbs: settingsStore.carbsGoal || 200
}))

// 計算プロパティ
const todayMeals = computed(() => mealStore.todayRecords)
const recentMeals = computed(() => mealStore.sortedRecords.slice(0, 5))
const mealHistory = computed(() => mealStore.sortedRecords)
const myMenus = computed(() => mealStore.myMenus)
const templates = computed(() => mealStore.templates)

const todaySummary = computed(() => {
  const totalCalories = mealStore.todayCalories
  return {
    totalCalories,
    mealCount: todayMeals.value.length,
    remaining: Math.max(0, calorieGoal.value - totalCalories)
  }
})

const nutritionBalance = computed(() => mealStore.todayPFC)

const nutritionProgress = computed(() => {
  return {
    protein: Math.min((nutritionBalance.value.protein / pfcGoals.value.protein) * 100, 100),
    fat: Math.min((nutritionBalance.value.fat / pfcGoals.value.fat) * 100, 100),
    carbs: Math.min((nutritionBalance.value.carbs / pfcGoals.value.carbs) * 100, 100)
  }
})

// メソッド
const getMealTypeBg = (type) => {
  const colors = {
    breakfast: 'bg-orange-100 text-orange-600',
    lunch: 'bg-blue-100 text-blue-600',
    dinner: 'bg-purple-100 text-purple-600',
    snack: 'bg-green-100 text-green-600'
  }
  return colors[type] || 'bg-gray-100 text-gray-600'
}

const getMealTypeIcon = (type) => {
  const icons = {
    breakfast: 'fas fa-sun',
    lunch: 'fas fa-cloud-sun',
    dinner: 'fas fa-moon',
    snack: 'fas fa-apple-alt'
  }
  return icons[type] || 'fas fa-utensils'
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
}

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
}

const formatDateTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString('ja-JP', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const saveMeal = async () => {
  if (!mealForm.mealType || !mealForm.name || !mealForm.calories) return
  
  try {
    const mealData = {
      mealType: mealForm.mealType,
      name: mealForm.name,
      notes: mealForm.notes || '',
      calories: mealForm.calories,
      protein: mealForm.protein || 0,
      fat: mealForm.fat || 0,
      carbs: mealForm.carbs || 0,
      fiber: mealForm.fiber || 0,
      sodium: mealForm.sodium || 0
    }

    if (editingMeal.value) {
      // 編集モード
      await mealStore.updateMealRecord(editingMeal.value.id, mealData)
      editingMeal.value = null
    } else {
      // 新規追加
      await mealStore.addMealRecord(mealData)
    }
    
    // フォームをリセット
    resetMealForm()
    showInputModal.value = false
  } catch (error) {
    console.error('食事記録保存エラー:', error)
  }
}

const editMeal = (meal) => {
  editingMeal.value = meal
  mealForm.mealType = meal.mealType
  mealForm.name = meal.name
  mealForm.notes = meal.notes || ''
  mealForm.calories = meal.calories
  mealForm.protein = meal.protein || ''
  mealForm.fat = meal.fat || ''
  mealForm.carbs = meal.carbs || ''
  mealForm.fiber = meal.fiber || ''
  mealForm.sodium = meal.sodium || ''
  mealForm.time = formatTime(meal.timestamp)
  
  showDetailModal.value = false
  showInputModal.value = true
}

const viewMeal = (meal) => {
  selectedMeal.value = meal
  showDetailModal.value = true
}

const deleteMeal = async () => {
  if (!selectedMeal.value) return
  
  if (confirm('この食事記録を削除しますか？')) {
    try {
      await mealStore.deleteMealRecord(selectedMeal.value.id)
      showDetailModal.value = false
      selectedMeal.value = null
    } catch (error) {
      console.error('食事記録削除エラー:', error)
    }
  }
}

const useMyMenu = (menu) => {
  mealForm.mealType = menu.mealType || 'lunch'
  mealForm.name = menu.name
  mealForm.notes = menu.notes || ''
  mealForm.calories = menu.calories
  mealForm.protein = menu.protein || ''
  mealForm.fat = menu.fat || ''
  mealForm.carbs = menu.carbs || ''
  mealForm.fiber = menu.fiber || ''
  mealForm.sodium = menu.sodium || ''
  mealForm.time = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  
  showMyMenuModal.value = false
  showInputModal.value = true
}

const useTemplate = (template) => {
  mealForm.mealType = template.mealType || 'lunch'
  mealForm.name = template.name
  mealForm.notes = template.notes || ''
  mealForm.calories = template.calories
  mealForm.protein = template.protein || ''
  mealForm.fat = template.fat || ''
  mealForm.carbs = template.carbs || ''
  mealForm.fiber = template.fiber || ''
  mealForm.sodium = template.sodium || ''
  mealForm.time = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  
  showTemplateModal.value = false
  showInputModal.value = true
}

const deleteMyMenu = async (menuId) => {
  if (confirm('このマイメニューを削除しますか？')) {
    try {
      await mealStore.deleteMyMenu(menuId)
    } catch (error) {
      console.error('マイメニュー削除エラー:', error)
    }
  }
}

const saveMyMenu = async () => {
  if (!menuForm.name || !menuForm.calories || !menuForm.mealType) return
  
  try {
    const menuData = {
      name: menuForm.name,
      notes: menuForm.notes || '',
      calories: menuForm.calories,
      mealType: menuForm.mealType,
      protein: menuForm.protein || 0,
      fat: menuForm.fat || 0,
      carbs: menuForm.carbs || 0,
      fiber: menuForm.fiber || 0,
      sodium: menuForm.sodium || 0
    }

    await mealStore.addMyMenu(menuData)
    
    // フォームをリセット
    resetMenuForm()
    showAddMenuModal.value = false
  } catch (error) {
    console.error('マイメニュー保存エラー:', error)
  }
}

const resetMealForm = () => {
  Object.keys(mealForm).forEach(key => {
    mealForm[key] = ''
  })
  editingMeal.value = null
}

const resetMenuForm = () => {
  Object.keys(menuForm).forEach(key => {
    menuForm[key] = ''
  })
}

const loadData = async () => {
  try {
    isLoading.value = true
    await Promise.all([
      mealStore.loadData(),
      settingsStore.loadSettings()
    ])
  } catch (error) {
    console.error('データ読み込みエラー:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.card {
  @apply bg-white rounded-lg shadow-sm p-6;
}

.input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.btn-secondary {
  @apply bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500;
}

.btn-danger {
  @apply bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500;
}

.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-md w-full mx-4;
}
</style> 