import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMealStore } from '../meal'

// Firebaseサービスのモック
vi.mock('@/services/firebase', () => ({
  DatabaseService: {
    addMealRecord: vi.fn(),
    getMealRecords: vi.fn(),
    updateMealRecord: vi.fn(),
    deleteMealRecord: vi.fn()
  }
}))

describe('Meal Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('初期状態', () => {
    it('初期状態が正しく設定される', () => {
      const store = useMealStore()
      
      expect(store.mealRecords).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(null)
      expect(store.todayCalories).toBe(0)
      expect(store.weeklyCalories).toEqual([])
    })
  })

  describe('addMealRecord', () => {
    it('食事記録の追加が成功する', async () => {
      const store = useMealStore()
      const mockRecord = {
        id: '1',
        name: '朝食',
        calories: 500,
        date: '2024-01-01',
        mealType: 'breakfast',
        notes: 'テスト記録'
      }
      
      const { DatabaseService } = await import('@/services/firebase')
      DatabaseService.addMealRecord.mockResolvedValue({
        success: true,
        record: mockRecord
      })
      
      const result = await store.addMealRecord({
        name: '朝食',
        calories: 500,
        date: '2024-01-01',
        mealType: 'breakfast',
        notes: 'テスト記録'
      })
      
      expect(result.success).toBe(true)
      expect(store.mealRecords).toContain(mockRecord)
    })

    it('食事記録の追加が失敗する', async () => {
      const store = useMealStore()
      
      const { DatabaseService } = await import('@/services/firebase')
      DatabaseService.addMealRecord.mockResolvedValue({
        success: false,
        error: 'データベースエラー'
      })
      
      const result = await store.addMealRecord({
        name: '朝食',
        calories: 500,
        date: '2024-01-01'
      })
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('データベースエラー')
      expect(store.mealRecords).toEqual([])
    })
  })

  describe('loadMealRecords', () => {
    it('食事記録の読み込みが成功する', async () => {
      const store = useMealStore()
      const mockRecords = [
        { id: '1', name: '朝食', calories: 500, date: '2024-01-01' },
        { id: '2', name: '昼食', calories: 800, date: '2024-01-01' }
      ]
      
      const { DatabaseService } = await import('@/services/firebase')
      DatabaseService.getMealRecords.mockResolvedValue({
        success: true,
        records: mockRecords
      })
      
      const result = await store.loadMealRecords()
      
      expect(result.success).toBe(true)
      expect(store.mealRecords).toEqual(mockRecords)
    })

    it('食事記録の読み込みが失敗する', async () => {
      const store = useMealStore()
      
      const { DatabaseService } = await import('@/services/firebase')
      DatabaseService.getMealRecords.mockResolvedValue({
        success: false,
        error: '読み込みエラー'
      })
      
      const result = await store.loadMealRecords()
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('読み込みエラー')
      expect(store.mealRecords).toEqual([])
    })
  })

  describe('updateMealRecord', () => {
    it('食事記録の更新が成功する', async () => {
      const store = useMealStore()
      const mockRecord = { id: '1', name: '朝食', calories: 500, date: '2024-01-01' }
      const updatedRecord = { ...mockRecord, calories: 600 }
      
      store.mealRecords = [mockRecord]
      
      const { DatabaseService } = await import('@/services/firebase')
      DatabaseService.updateMealRecord.mockResolvedValue({
        success: true,
        record: updatedRecord
      })
      
      const result = await store.updateMealRecord('1', { calories: 600 })
      
      expect(result.success).toBe(true)
      expect(store.mealRecords[0]).toEqual(updatedRecord)
    })
  })

  describe('deleteMealRecord', () => {
    it('食事記録の削除が成功する', async () => {
      const store = useMealStore()
      const mockRecord = { id: '1', name: '朝食', calories: 500, date: '2024-01-01' }
      
      store.mealRecords = [mockRecord]
      
      const { DatabaseService } = await import('@/services/firebase')
      DatabaseService.deleteMealRecord.mockResolvedValue({
        success: true
      })
      
      const result = await store.deleteMealRecord('1')
      
      expect(result.success).toBe(true)
      expect(store.mealRecords).toEqual([])
    })
  })

  describe('getTodayCalories', () => {
    it('今日のカロリーが正しく計算される', () => {
      const store = useMealStore()
      const today = new Date().toISOString().split('T')[0]
      
      store.mealRecords = [
        { calories: 500, date: today },
        { calories: 800, date: today },
        { calories: 600, date: '2024-01-01' } // 別の日
      ]
      
      const todayCalories = store.getTodayCalories()
      
      expect(todayCalories).toBe(1300)
    })
  })

  describe('getWeeklyCalories', () => {
    it('週間カロリーが正しく計算される', () => {
      const store = useMealStore()
      
      store.mealRecords = [
        { calories: 500, date: '2024-01-01' },
        { calories: 800, date: '2024-01-01' },
        { calories: 600, date: '2024-01-02' },
        { calories: 700, date: '2024-01-03' }
      ]
      
      const weeklyCalories = store.getWeeklyCalories()
      
      expect(weeklyCalories).toHaveLength(7)
      expect(weeklyCalories[0]).toBe(1300) // 2024-01-01
      expect(weeklyCalories[1]).toBe(600)  // 2024-01-02
      expect(weeklyCalories[2]).toBe(700)  // 2024-01-03
    })
  })

  describe('getMealTypeRecords', () => {
    it('食事タイプ別の記録が正しく取得される', () => {
      const store = useMealStore()
      
      store.mealRecords = [
        { mealType: 'breakfast', name: '朝食', calories: 500 },
        { mealType: 'lunch', name: '昼食', calories: 800 },
        { mealType: 'dinner', name: '夕食', calories: 600 },
        { mealType: 'breakfast', name: '朝食2', calories: 400 }
      ]
      
      const breakfastRecords = store.getMealTypeRecords('breakfast')
      
      expect(breakfastRecords).toHaveLength(2)
      expect(breakfastRecords[0].name).toBe('朝食')
      expect(breakfastRecords[1].name).toBe('朝食2')
    })
  })
}) 