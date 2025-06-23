<template>
  <div class="min-h-screen bg-gray-50 pb-24">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <router-link to="/settings" class="mr-3 text-gray-600 hover:text-gray-800">
              <i class="fas fa-arrow-left text-xl"></i>
            </router-link>
            <h1 class="text-xl font-bold">リマインダー設定</h1>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6">
      <div class="card">
        <div class="text-center py-12">
          <i class="fas fa-bell text-4xl text-gray-400 mb-4"></i>
          <h2 class="text-xl font-bold text-gray-700 mb-2">リマインダー設定画面</h2>
          <p class="text-gray-600 mb-4">この画面は現在開発中です</p>
          <router-link to="/settings" class="btn-primary">
            <i class="fas fa-arrow-left mr-2"></i>設定に戻る
          </router-link>
        </div>
      </div>
    </main>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script setup>
import BottomNavigation from '@/components/BottomNavigation.vue'
</script> 