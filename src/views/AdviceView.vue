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
            <h1 class="text-xl font-bold">アドバイス・コラム</h1>
          </div>
          <div class="flex space-x-2">
            <button @click="showSearchModal = true" class="p-2 text-gray-600 hover:text-gray-800">
              <i class="fas fa-search text-xl"></i>
            </button>
            <button @click="showFavoriteModal = true" class="p-2 text-gray-600 hover:text-gray-800">
              <i class="fas fa-heart text-xl"></i>
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
      <!-- Personalized Advice -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">あなたへのアドバイス</h2>
          
          <div v-if="personalizedAdvice" class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
            <div class="flex items-start">
              <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 flex-shrink-0">
                <i class="fas fa-user-check"></i>
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-blue-800 mb-2">{{ personalizedAdvice.title }}</h3>
                <p class="text-blue-700 text-sm mb-3">{{ personalizedAdvice.content }}</p>
                <div class="flex items-center text-xs text-blue-600">
                  <i class="fas fa-calendar mr-1"></i>
                  {{ formatDate(personalizedAdvice.date) }}
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-gray-500">
            <i class="fas fa-user-check text-3xl mb-2"></i>
            <p>パーソナライズドアドバイスがありません</p>
            <p class="text-sm">記録を続けてアドバイスを獲得しましょう</p>
          </div>
        </div>
      </section>

      <!-- Today's Knowledge -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">今日の豆知識</h2>
          
          <div class="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
            <div class="flex items-start">
              <div class="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 flex-shrink-0">
                <i class="fas fa-lightbulb"></i>
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-green-800 mb-2">{{ todayKnowledge.title }}</h3>
                <p class="text-green-700 text-sm mb-3">{{ todayKnowledge.content }}</p>
                <div class="flex items-center text-xs text-green-600">
                  <i class="fas fa-calendar mr-1"></i>
                  {{ formatDate(todayKnowledge.date) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Category Tabs -->
      <section class="mb-8">
        <div class="card">
          <div class="flex space-x-2 mb-4 overflow-x-auto">
            <button
              v-for="category in categories"
              :key="category.id"
              @click="selectCategory(category.id)"
              :class="[
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition',
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              ]"
            >
              <i :class="category.icon + ' mr-2'"></i>
              {{ category.name }}
            </button>
          </div>
          
          <div v-if="filteredArticles.length > 0" class="space-y-4">
            <div
              v-for="article in filteredArticles"
              :key="article.id"
              class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
              @click="viewArticle(article)"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center mb-2">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                         :class="getCategoryBg(article.category)">
                      <i :class="getCategoryIcon(article.category)"></i>
                    </div>
                    <h3 class="text-lg font-semibold">{{ article.title }}</h3>
                  </div>
                  
                  <p class="text-gray-600 text-sm mb-3">{{ article.excerpt }}</p>
                  
                  <div class="flex items-center justify-between text-xs text-gray-500">
                    <div class="flex items-center space-x-4">
                      <span class="flex items-center">
                        <i class="fas fa-calendar mr-1"></i>
                        {{ formatDate(article.date) }}
                      </span>
                      <span class="flex items-center">
                        <i class="fas fa-clock mr-1"></i>
                        {{ article.readTime }}分
                      </span>
                      <span class="flex items-center">
                        <i class="fas fa-eye mr-1"></i>
                        {{ article.views }}回
                      </span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <span class="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        {{ getCategoryName(article.category) }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div class="flex flex-col items-end space-y-2">
                  <button @click.stop="toggleFavorite(article)" class="text-gray-400 hover:text-red-600">
                    <i :class="isFavorite(article.id) ? 'fas fa-heart text-red-600' : 'far fa-heart'"></i>
                  </button>
                  <i class="fas fa-chevron-right text-gray-400"></i>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-gray-500">
            <i class="fas fa-newspaper text-3xl mb-2"></i>
            <p>このカテゴリの記事がありません</p>
          </div>
        </div>
      </section>

      <!-- Popular Articles -->
      <section class="mb-8">
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">人気記事</h2>
            <button @click="showAllArticles = !showAllArticles" class="text-blue-600 hover:text-blue-800 text-sm">
              {{ showAllArticles ? '一部表示' : 'すべて表示' }}
            </button>
          </div>
          
          <div class="space-y-3">
            <div
              v-for="article in popularArticles"
              :key="article.id"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              @click="viewArticle(article)"
            >
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                     :class="getCategoryBg(article.category)">
                  <i :class="getCategoryIcon(article.category)"></i>
                </div>
                <div>
                  <p class="font-medium">{{ article.title }}</p>
                  <p class="text-sm text-gray-600">{{ article.excerpt }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(article.date) }} · {{ article.readTime }}分</p>
                </div>
              </div>
              <div class="text-right">
                <button @click.stop="toggleFavorite(article)" class="text-gray-400 hover:text-red-600 mr-2">
                  <i :class="isFavorite(article.id) ? 'fas fa-heart text-red-600' : 'far fa-heart'"></i>
                </button>
                <i class="fas fa-chevron-right text-gray-400"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Motivation Section -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">今日のモチベーション</h2>
          
          <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
            <div class="flex items-start">
              <div class="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-3 flex-shrink-0">
                <i class="fas fa-star"></i>
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-purple-800 mb-2">{{ motivationMessage.title }}</h3>
                <p class="text-purple-700 text-sm mb-3">{{ motivationMessage.content }}</p>
                <div class="flex items-center text-xs text-purple-600">
                  <i class="fas fa-quote-left mr-1"></i>
                  {{ motivationMessage.author }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Bottom Navigation -->
    <BottomNavigation />

    <!-- Article Detail Modal -->
    <div v-if="showArticleModal" class="modal-overlay" @click="showArticleModal = false">
      <div class="modal-content max-h-screen overflow-y-auto" @click.stop>
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-semibold">記事詳細</h3>
          <button @click="showArticleModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-4">
          <div v-if="selectedArticle" class="space-y-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600 mb-2">{{ selectedArticle.title }}</div>
              <div class="flex items-center justify-center space-x-4 text-sm text-gray-500 mb-4">
                <span class="flex items-center">
                  <i class="fas fa-calendar mr-1"></i>
                  {{ formatDate(selectedArticle.date) }}
                </span>
                <span class="flex items-center">
                  <i class="fas fa-clock mr-1"></i>
                  {{ selectedArticle.readTime }}分
                </span>
                <span class="flex items-center">
                  <i class="fas fa-eye mr-1"></i>
                  {{ selectedArticle.views }}回
                </span>
              </div>
            </div>
            
            <div class="prose max-w-none">
              <div v-html="selectedArticle.content"></div>
            </div>
            
            <div class="flex items-center justify-between pt-4 border-t border-gray-200">
              <div class="flex items-center space-x-2">
                <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {{ getCategoryName(selectedArticle.category) }}
                </span>
              </div>
              <button @click="toggleFavorite(selectedArticle)" class="flex items-center space-x-2 text-gray-600 hover:text-red-600">
                <i :class="isFavorite(selectedArticle.id) ? 'fas fa-heart text-red-600' : 'far fa-heart'"></i>
                <span>{{ isFavorite(selectedArticle.id) ? 'お気に入り解除' : 'お気に入り追加' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Search Modal -->
    <div v-if="showSearchModal" class="modal-overlay" @click="showSearchModal = false">
      <div class="modal-content" @click.stop>
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-semibold">記事検索</h3>
          <button @click="showSearchModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-4">
          <div class="mb-4">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="キーワードを入力..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              @input="searchArticles"
            />
          </div>
          
          <div v-if="searchResults.length > 0" class="space-y-3 max-h-64 overflow-y-auto">
            <div
              v-for="article in searchResults"
              :key="article.id"
              class="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              @click="viewArticle(article); showSearchModal = false"
            >
              <h4 class="font-medium">{{ article.title }}</h4>
              <p class="text-sm text-gray-600">{{ article.excerpt }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ getCategoryName(article.category) }} · {{ formatDate(article.date) }}</p>
            </div>
          </div>
          
          <div v-else-if="searchQuery" class="text-center py-8 text-gray-500">
            <i class="fas fa-search text-3xl mb-2"></i>
            <p>検索結果がありません</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Favorite Modal -->
    <div v-if="showFavoriteModal" class="modal-overlay" @click="showFavoriteModal = false">
      <div class="modal-content max-h-96 overflow-y-auto" @click.stop>
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-semibold">お気に入り記事</h3>
          <button @click="showFavoriteModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-4">
          <div v-if="favoriteArticles.length > 0" class="space-y-3">
            <div
              v-for="article in favoriteArticles"
              :key="article.id"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              @click="viewArticle(article)"
            >
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-3">
                  <i class="fas fa-heart"></i>
                </div>
                <div>
                  <p class="font-medium">{{ article.title }}</p>
                  <p class="text-sm text-gray-600">{{ article.excerpt }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(article.date) }}</p>
                </div>
              </div>
              <div class="text-right">
                <button @click.stop="removeFavorite(article.id)" class="text-red-600 hover:text-red-800">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-gray-500">
            <i class="fas fa-heart text-3xl mb-2"></i>
            <p>お気に入り記事がありません</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWeightStore } from '@/stores/weight'
import { useMealStore } from '@/stores/meal'
import { useExerciseStore } from '@/stores/exercise'
import BottomNavigation from '@/components/BottomNavigation.vue'

// ストアの初期化
const weightStore = useWeightStore()
const mealStore = useMealStore()
const exerciseStore = useExerciseStore()

// リアクティブデータ
const isLoading = ref(true)
const showArticleModal = ref(false)
const showSearchModal = ref(false)
const showFavoriteModal = ref(false)
const selectedArticle = ref(null)
const selectedCategory = ref('all')
const searchQuery = ref('')
const searchResults = ref([])
const showAllArticles = ref(false)
const favoriteArticles = ref([])

// カテゴリ定義
const categories = [
  { id: 'all', name: 'すべて', icon: 'fas fa-th-large' },
  { id: 'diet', name: 'ダイエット', icon: 'fas fa-weight' },
  { id: 'nutrition', name: '栄養', icon: 'fas fa-apple-alt' },
  { id: 'exercise', name: '運動', icon: 'fas fa-running' },
  { id: 'motivation', name: 'モチベーション', icon: 'fas fa-star' },
  { id: 'health', name: '健康', icon: 'fas fa-heartbeat' },
  { id: 'recipe', name: 'レシピ', icon: 'fas fa-utensils' }
]

// 記事データ
const articles = ref([
  {
    id: 1,
    title: '初心者向けダイエットの基本',
    excerpt: 'ダイエットを始める前に知っておきたい基本知識をまとめました。',
    content: `
      <h3>ダイエットの基本原則</h3>
      <p>ダイエットは単純に体重を減らすことではありません。健康的な生活習慣を身につけることが重要です。</p>
      
      <h4>1. カロリー収支の管理</h4>
      <p>消費カロリーが摂取カロリーを上回ることで体重が減ります。ただし、極端な制限は避けましょう。</p>
      
      <h4>2. 栄養バランスの重要性</h4>
      <p>タンパク質、脂質、炭水化物のバランスを保つことが大切です。</p>
      
      <h4>3. 運動の効果</h4>
      <p>有酸素運動と筋力トレーニングを組み合わせることで効果的に脂肪を燃焼できます。</p>
      
      <h4>4. 継続のコツ</h4>
      <p>無理のない目標設定と、楽しめる運動を見つけることが継続の秘訣です。</p>
    `,
    category: 'diet',
    date: new Date('2024-01-15'),
    readTime: 5,
    views: 1250
  },
  {
    id: 2,
    title: 'PFCバランスの理想的な比率',
    excerpt: 'タンパク質、脂質、炭水化物の最適なバランスについて解説します。',
    content: `
      <h3>PFCバランスとは</h3>
      <p>PFCバランスは、Protein（タンパク質）、Fat（脂質）、Carbohydrate（炭水化物）の頭文字を取ったものです。</p>
      
      <h4>理想的な比率</h4>
      <ul>
        <li><strong>タンパク質:</strong> 15-20%</li>
        <li><strong>脂質:</strong> 20-30%</li>
        <li><strong>炭水化物:</strong> 50-65%</li>
      </ul>
      
      <h4>各栄養素の役割</h4>
      <p><strong>タンパク質:</strong> 筋肉の修復・成長、代謝の促進</p>
      <p><strong>脂質:</strong> ホルモンの材料、脂溶性ビタミンの吸収</p>
      <p><strong>炭水化物:</strong> エネルギー源、脳の栄養</p>
    `,
    category: 'nutrition',
    date: new Date('2024-01-10'),
    readTime: 4,
    views: 980
  },
  {
    id: 3,
    title: '自宅でできる効果的な運動メニュー',
    excerpt: '器具を使わずに自宅でできる運動を紹介します。',
    content: `
      <h3>自宅運動のメリット</h3>
      <p>時間や場所を選ばず、いつでも始められるのが自宅運動の最大のメリットです。</p>
      
      <h4>初心者向けメニュー</h4>
      <ol>
        <li><strong>スクワット:</strong> 10回 × 3セット</li>
        <li><strong>プッシュアップ:</strong> 5回 × 3セット</li>
        <li><strong>プランク:</strong> 30秒 × 3セット</li>
        <li><strong>ジャンピングジャック:</strong> 30秒 × 3セット</li>
      </ol>
      
      <h4>中級者向けメニュー</h4>
      <ol>
        <li><strong>バーピー:</strong> 10回 × 3セット</li>
        <li><strong>マウンテンクライマー:</strong> 30秒 × 3セット</li>
        <li><strong>ジャンプスクワット:</strong> 15回 × 3セット</li>
      </ol>
    `,
    category: 'exercise',
    date: new Date('2024-01-08'),
    readTime: 6,
    views: 1560
  },
  {
    id: 4,
    title: 'ダイエット継続のためのモチベーション維持法',
    excerpt: '3日坊主にならないための心理的テクニックを紹介します。',
    content: `
      <h3>モチベーション維持のコツ</h3>
      <p>ダイエットの成功は継続力にかかっています。モチベーションを維持する方法を学びましょう。</p>
      
      <h4>1. 小さな目標を設定する</h4>
      <p>大きな目標ではなく、達成可能な小さな目標を設定しましょう。</p>
      
      <h4>2. 記録をつける</h4>
      <p>進捗を可視化することで、モチベーションが維持されます。</p>
      
      <h4>3. ご褒美を設定する</h4>
      <p>目標達成時に自分へのご褒美を設定しましょう。</p>
      
      <h4>4. 仲間を作る</h4>
      <p>同じ目標を持つ仲間と一緒に取り組むことで継続しやすくなります。</p>
    `,
    category: 'motivation',
    date: new Date('2024-01-05'),
    readTime: 4,
    views: 890
  },
  {
    id: 5,
    title: '健康的な朝食レシピ集',
    excerpt: 'ダイエット中でも美味しく食べられる朝食レシピを紹介します。',
    content: `
      <h3>朝食の重要性</h3>
      <p>朝食は1日の代謝を上げ、過食を防ぐ重要な役割があります。</p>
      
      <h4>簡単朝食レシピ</h4>
      
      <h5>1. オートミールヨーグルト</h5>
      <p><strong>材料:</strong> オートミール、ヨーグルト、はちみつ、フルーツ</p>
      <p><strong>作り方:</strong> オートミールにヨーグルトをかけて、はちみつとフルーツをトッピング</p>
      
      <h5>2. スクランブルエッグトースト</h5>
      <p><strong>材料:</strong> 卵、全粒粉パン、野菜</p>
      <p><strong>作り方:</strong> 卵をスクランブルして、野菜と一緒にトーストにのせる</p>
    `,
    category: 'recipe',
    date: new Date('2024-01-03'),
    readTime: 3,
    views: 720
  },
  {
    id: 6,
    title: '睡眠とダイエットの関係',
    excerpt: '良質な睡眠がダイエット成功の鍵となる理由を解説します。',
    content: `
      <h3>睡眠と代謝の関係</h3>
      <p>睡眠不足は代謝を低下させ、食欲を増進させるホルモンの分泌を促します。</p>
      
      <h4>睡眠がダイエットに与える影響</h4>
      <ul>
        <li>代謝の低下</li>
        <li>食欲増進ホルモンの分泌</li>
        <li>ストレスホルモンの増加</li>
        <li>運動パフォーマンスの低下</li>
      </ul>
      
      <h4>良質な睡眠のためのコツ</h4>
      <ol>
        <li>規則正しい生活リズム</li>
        <li>就寝前のスマートフォン使用を避ける</li>
        <li>適度な運動</li>
        <li>リラックスできる環境作り</li>
      </ol>
    `,
    category: 'health',
    date: new Date('2024-01-01'),
    readTime: 4,
    views: 650
  }
])

// 計算プロパティ
const filteredArticles = computed(() => {
  if (selectedCategory.value === 'all') {
    return articles.value
  }
  return articles.value.filter(article => article.category === selectedCategory.value)
})

const popularArticles = computed(() => {
  const sorted = [...articles.value].sort((a, b) => b.views - a.views)
  return showAllArticles.value ? sorted : sorted.slice(0, 3)
})

const personalizedAdvice = computed(() => {
  const currentWeight = weightStore.currentWeight
  const targetWeight = weightStore.targetWeight
  const averageCalories = mealStore.averageDailyCalories
  const exerciseDays = exerciseStore.exerciseDays
  
  if (!currentWeight || !targetWeight) {
    return null
  }
  
  const weightDiff = currentWeight - targetWeight
  const progress = weightStore.weightProgress.length > 0 ? weightStore.weightProgress[weightStore.weightProgress.length - 1] : null
  
  if (weightDiff > 0) {
    return {
      title: '体重管理のアドバイス',
      content: `現在の体重${currentWeight}kgから目標体重${targetWeight}kgまで、あと${Math.round(weightDiff * 10) / 10}kgです。継続的な記録と適度な運動で目標達成を目指しましょう。`,
      date: new Date()
    }
  } else if (averageCalories > 2000) {
    return {
      title: 'カロリー管理のアドバイス',
      content: `現在の平均摂取カロリーは${averageCalories}kcalです。目標カロリーを意識して、栄養バランスの良い食事を心がけましょう。`,
      date: new Date()
    }
  } else if (exerciseDays < 3) {
    return {
      title: '運動習慣のアドバイス',
      content: `今週の運動日数は${exerciseDays}日です。週3日以上の運動を目標に、無理のない範囲で運動習慣を身につけましょう。`,
      date: new Date()
    }
  }
  
  return {
    title: '素晴らしい進捗です！',
    content: '現在の記録と運動習慣が良好です。この調子で継続して、さらなる健康向上を目指しましょう。',
    date: new Date()
  }
})

const todayKnowledge = computed(() => {
  const knowledgeList = [
    {
      title: '水分補給の重要性',
      content: '1日2リットルの水分補給が代謝を促進し、ダイエット効果を高めます。特に運動前後の水分補給は重要です。',
      date: new Date()
    },
    {
      title: '食事のタイミング',
      content: '朝食をしっかり取ることで、1日の代謝が向上し、過食を防ぐことができます。',
      date: new Date()
    },
    {
      title: '運動の効果的な時間帯',
      content: '夕方から夜にかけての運動が最も効果的です。体温が高く、筋肉の柔軟性も向上しています。',
      date: new Date()
    },
    {
      title: 'ストレスとダイエット',
      content: 'ストレスは食欲を増進させるホルモンの分泌を促します。適度な運動やリラックス法でストレス管理をしましょう。',
      date: new Date()
    }
  ]
  
  const today = new Date().getDate()
  return knowledgeList[today % knowledgeList.length]
})

const motivationMessage = computed(() => {
  const messages = [
    {
      title: '小さな一歩が大きな変化を生む',
      content: '今日の小さな努力が、明日の大きな成果につながります。一歩ずつ着実に進んでいきましょう。',
      author: 'ダイエット応援ノート'
    },
    {
      title: '継続は力なり',
      content: '完璧を目指すのではなく、継続できることを目指しましょう。毎日の積み重ねが成功への道です。',
      author: 'ダイエット応援ノート'
    },
    {
      title: '自分を信じる',
      content: 'あなたには必ず目標を達成する力があります。自分を信じて、前向きに取り組みましょう。',
      author: 'ダイエット応援ノート'
    }
  ]
  
  const today = new Date().getDate()
  return messages[today % messages.length]
})

// メソッド
const selectCategory = (categoryId) => {
  selectedCategory.value = categoryId
}

const viewArticle = (article) => {
  selectedArticle.value = article
  showArticleModal.value = true
  
  // 閲覧数を増加
  article.views++
}

const searchArticles = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }
  
  const query = searchQuery.value.toLowerCase()
  searchResults.value = articles.value.filter(article => 
    article.title.toLowerCase().includes(query) ||
    article.excerpt.toLowerCase().includes(query) ||
    article.content.toLowerCase().includes(query)
  )
}

const isFavorite = (articleId) => {
  return favoriteArticles.value.some(article => article.id === articleId)
}

const toggleFavorite = (article) => {
  if (isFavorite(article.id)) {
    removeFavorite(article.id)
  } else {
    addFavorite(article)
  }
}

const addFavorite = (article) => {
  if (!isFavorite(article.id)) {
    favoriteArticles.value.push(article)
    saveFavorites()
    
    if (window.$notify) {
      window.$notify.success('お気に入り追加', '記事をお気に入りに追加しました')
    }
  }
}

const removeFavorite = (articleId) => {
  favoriteArticles.value = favoriteArticles.value.filter(article => article.id !== articleId)
  saveFavorites()
  
  if (window.$notify) {
    window.$notify.success('お気に入り削除', 'お気に入りから削除しました')
  }
}

const saveFavorites = () => {
  try {
    localStorage.setItem('favoriteArticles', JSON.stringify(favoriteArticles.value))
  } catch (error) {
    console.error('お気に入り保存エラー:', error)
  }
}

const loadFavorites = () => {
  try {
    const saved = localStorage.getItem('favoriteArticles')
    if (saved) {
      favoriteArticles.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('お気に入り読み込みエラー:', error)
  }
}

const getCategoryName = (categoryId) => {
  const category = categories.find(cat => cat.id === categoryId)
  return category ? category.name : 'その他'
}

const getCategoryBg = (categoryId) => {
  const bgClasses = {
    diet: 'bg-blue-100 text-blue-600',
    nutrition: 'bg-green-100 text-green-600',
    exercise: 'bg-red-100 text-red-600',
    motivation: 'bg-yellow-100 text-yellow-600',
    health: 'bg-purple-100 text-purple-600',
    recipe: 'bg-orange-100 text-orange-600'
  }
  return bgClasses[categoryId] || 'bg-gray-100 text-gray-600'
}

const getCategoryIcon = (categoryId) => {
  const icons = {
    diet: 'fas fa-weight',
    nutrition: 'fas fa-apple-alt',
    exercise: 'fas fa-running',
    motivation: 'fas fa-star',
    health: 'fas fa-heartbeat',
    recipe: 'fas fa-utensils'
  }
  return icons[categoryId] || 'fas fa-newspaper'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ja-JP', { 
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// 初期化
onMounted(async () => {
  try {
    isLoading.value = true
    await Promise.all([
      weightStore.loadData(),
      mealStore.loadData(),
      exerciseStore.loadData()
    ])
    loadFavorites()
  } catch (error) {
    console.error('データ読み込みエラー:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.card {
  @apply bg-white rounded-lg shadow-sm p-6;
}

.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-md w-full mx-4;
}

.prose {
  @apply text-gray-700 leading-relaxed;
}

.prose h3 {
  @apply text-lg font-semibold text-gray-800 mt-4 mb-2;
}

.prose h4 {
  @apply text-base font-medium text-gray-800 mt-3 mb-2;
}

.prose h5 {
  @apply text-sm font-medium text-gray-800 mt-2 mb-1;
}

.prose p {
  @apply mb-3;
}

.prose ul, .prose ol {
  @apply mb-3 pl-5;
}

.prose li {
  @apply mb-1;
}

.prose strong {
  @apply font-semibold;
}
</style> 