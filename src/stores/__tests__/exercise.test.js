import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useExerciseStore } from '../exercise'

// Firebaseサービスのモック
vi.mock('@/services/firebase', () => ({
  DatabaseService: {
    addExerciseRecord: vi.fn(),
    getExerciseRecords: vi.fn(),
    updateExerciseRecord: vi.fn(),
    deleteExerciseRecord: vi.fn()
  }
}))

describe('Exercise Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('初期状態', () => {
    it('初期状態が正しく設定される', () => {
      const store = useExerciseStore()
      
      expect(store.exerciseRecords).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(null)
      expect(store.todayCalories).toBe(0)
      expect(store.weeklyCalories).toEqual([])
    })
  })

  describe('addExerciseRecord', () => {
    it('運動記録の追加が成功する', async () => {
      const store = useExerciseStore()
      const mockRecord = {
        id: '1',
        name: 'ランニング',
        calories: 300,
        duration: 30,
        date: '2024-01-01',
        exerciseType: 'cardio',
        notes: 'テスト記録'
      }
      
      const { DatabaseService } = await import('@/services/firebase')
      DatabaseService.addExerciseRecord.mockResolvedValue({
        success: true,
        record: mockRecord
      })
      
      const result = await store.addExerciseRecord({
        name: 'ランニング',
        calories: 300,
        duration: 30,
        date: '2024-01-01',
        exerciseType: 'cardio',
        notes: 'テスト記録'
      })
      
      expect(result.success).toBe(true)
      expect(store.exerciseRecords).toContain(mockRecord)
    })

    it('運動記録の追加が失敗する', async () => {
      const store = useExerciseStore()
      
      const { DatabaseService } = await import('@/services/firebase')
      DatabaseService.addExerciseRecord.mockResolvedValue({
        success: false,
        error: 'データベースエラー'
      })
      
      const result = await store.addExerciseRecord({
        name: 'ランニング',
        calories: 300,
        duration: 30,
        date: '2024-01-01'
      })
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('データベースエラー')
      expect(store.exerciseRecords).toEqual([])
    })
  })

  describe('loadExerciseRecords', () => {
    it('運動記録の読み込みが成功する', async () => {
      const store = useExerciseStore()
      const mockRecords = [
        { id: '1', name: 'ランニング', calories: 300, date: '2024-01-01' },
        { id: '2', name: '筋トレ', calories: 200, date: '2024-01-01' }
      ]
      
      const { DatabaseService } = await import('@/services/firebase')
      DatabaseService.getExerciseRecords.mockResolvedValue({
        success: true,
        records: mockRecords
      })
      
      const result = await store.loadExerciseRecords()
      
      expect(result.success).toBe(true)
      expect(store.exerciseRecords).toEqual(mockRecords)
    })

    it('運動記録の読み込みが失敗する', async () => {
      const store = useExerciseStore()
      
      const { DatabaseService } = await import('@/services/firebase')
      DatabaseService.getExerciseRecords.mockResolvedValue({
        success: false,
        error: '読み込みエラー'
      })
      
      const result = await store.loadExerciseRecords()
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('読み込みエラー')
      expect(store.exerciseRecords).toEqual([])
    })
  })

  describe('updateExerciseRecord', () => {
    it('運動記録の更新が成功する', async () => {
      const store = useExerciseStore()
      const mockRecord = { id: '1', name: 'ランニング', calories: 300, date: '2024-01-01' }
      const updatedRecord = { ...mockRecord, calories: 400 }
      
      store.exerciseRecords = [mockRecord]
      
      const { DatabaseService } = await import('@/services/firebase')
      DatabaseService.updateExerciseRecord.mockResolvedValue({
        success: true,
        record: updatedRecord
      })
      
      const result = await store.updateExerciseRecord('1', { calories: 400 })
      
      expect(result.success).toBe(true)
      expect(store.exerciseRecords[0]).toEqual(updatedRecord)
    })
  })

  describe('deleteExerciseRecord', () => {
    it('運動記録の削除が成功する', async () => {
      const store = useExerciseStore()
      const mockRecord = { id: '1', name: 'ランニング', calories: 300, date: '2024-01-01' }
      
      store.exerciseRecords = [mockRecord]
      
      const { DatabaseService } = await import('@/services/firebase')
      DatabaseService.deleteExerciseRecord.mockResolvedValue({
        success: true
      })
      
      const result = await store.deleteExerciseRecord('1')
      
      expect(result.success).toBe(true)
      expect(store.exerciseRecords).toEqual([])
    })
  })

  describe('getTodayCalories', () => {
    it('今日の消費カロリーが正しく計算される', () => {
      const store = useExerciseStore()
      const today = new Date().toISOString().split('T')[0]
      
      store.exerciseRecords = [
        { calories: 300, date: today },
        { calories: 200, date: today },
        { calories: 150, date: '2024-01-01' } // 別の日
      ]
      
      const todayCalories = store.getTodayCalories()
      
      expect(todayCalories).toBe(500)
    })
  })

  describe('getWeeklyCalories', () => {
    it('週間消費カロリーが正しく計算される', () => {
      const store = useExerciseStore()
      
      store.exerciseRecords = [
        { calories: 300, date: '2024-01-01' },
        { calories: 200, date: '2024-01-01' },
        { calories: 250, date: '2024-01-02' },
        { calories: 180, date: '2024-01-03' }
      ]
      
      const weeklyCalories = store.getWeeklyCalories()
      
      expect(weeklyCalories).toHaveLength(7)
      expect(weeklyCalories[0]).toBe(500) // 2024-01-01
      expect(weeklyCalories[1]).toBe(250) // 2024-01-02
      expect(weeklyCalories[2]).toBe(180) // 2024-01-03
    })
  })

  describe('getExerciseTypeRecords', () => {
    it('運動タイプ別の記録が正しく取得される', () => {
      const store = useExerciseStore()
      
      store.exerciseRecords = [
        { exerciseType: 'cardio', name: 'ランニング', calories: 300 },
        { exerciseType: 'strength', name: '筋トレ', calories: 200 },
        { exerciseType: 'flexibility', name: 'ストレッチ', calories: 50 },
        { exerciseType: 'cardio', name: 'ウォーキング', calories: 150 }
      ]
      
      const cardioRecords = store.getExerciseTypeRecords('cardio')
      
      expect(cardioRecords).toHaveLength(2)
      expect(cardioRecords[0].name).toBe('ランニング')
      expect(cardioRecords[1].name).toBe('ウォーキング')
    })
  })

  describe('getExerciseStats', () => {
    it('運動統計が正しく計算される', () => {
      const store = useExerciseStore()
      
      store.exerciseRecords = [
        { calories: 300, duration: 30, date: '2024-01-01' },
        { calories: 200, duration: 20, date: '2024-01-01' },
        { calories: 250, duration: 25, date: '2024-01-02' }
      ]
      
      const stats = store.getExerciseStats()
      
      expect(stats.totalCalories).toBe(750)
      expect(stats.totalDuration).toBe(75)
      expect(stats.averageCalories).toBe(250)
      expect(stats.averageDuration).toBe(25)
    })
  })
}) 