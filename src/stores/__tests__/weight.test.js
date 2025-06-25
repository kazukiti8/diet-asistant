import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useWeightStore } from '../weight'

// Firebaseサービスのモック
vi.mock('@/services/firebase', () => ({
  DatabaseService: {
    addWeightRecord: vi.fn(),
    getWeightRecords: vi.fn(),
    updateWeightRecord: vi.fn(),
    deleteWeightRecord: vi.fn()
  }
}))

describe('Weight Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('初期状態', () => {
    it('初期状態が正しく設定される', () => {
      const store = useWeightStore()
      
      expect(store.weightRecords).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(null)
      expect(store.currentWeight).toBe(null)
      expect(store.targetWeight).toBe(null)
    })
  })

  describe('addWeightRecord', () => {
    it('体重記録の追加が成功する', async () => {
      const store = useWeightStore()
      const mockRecord = {
        id: '1',
        weight: 70.5,
        date: '2024-01-01',
        notes: 'テスト記録'
      }
      
      const { DatabaseService } = await import('@/services/firebase')
      DatabaseService.addWeightRecord.mockResolvedValue({
        success: true,
        record: mockRecord
      })
      
      const result = await store.addWeightRecord({
        weight: 70.5,
        date: '2024-01-01',
        notes: 'テスト記録'
      })
      
      expect(result.success).toBe(true)
      expect(store.weightRecords).toContain(mockRecord)
      expect(store.currentWeight).toBe(70.5)
    })

    it('体重記録の追加が失敗する', async () => {
      const store = useWeightStore()
      
      const { DatabaseService } = await import('@/services/firebase')
      DatabaseService.addWeightRecord.mockResolvedValue({
        success: false,
        error: 'データベースエラー'
      })
      
      const result = await store.addWeightRecord({
        weight: 70.5,
        date: '2024-01-01'
      })
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('データベースエラー')
      expect(store.weightRecords).toEqual([])
    })
  })

  describe('loadWeightRecords', () => {
    it('体重記録の読み込みが成功する', async () => {
      const store = useWeightStore()
      const mockRecords = [
        { id: '1', weight: 70.5, date: '2024-01-01' },
        { id: '2', weight: 70.0, date: '2024-01-02' }
      ]
      
      const { DatabaseService } = await import('@/services/firebase')
      DatabaseService.getWeightRecords.mockResolvedValue({
        success: true,
        records: mockRecords
      })
      
      const result = await store.loadWeightRecords()
      
      expect(result.success).toBe(true)
      expect(store.weightRecords).toEqual(mockRecords)
      expect(store.currentWeight).toBe(70.0) // 最新の記録
    })

    it('体重記録の読み込みが失敗する', async () => {
      const store = useWeightStore()
      
      const { DatabaseService } = await import('@/services/firebase')
      DatabaseService.getWeightRecords.mockResolvedValue({
        success: false,
        error: '読み込みエラー'
      })
      
      const result = await store.loadWeightRecords()
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('読み込みエラー')
      expect(store.weightRecords).toEqual([])
    })
  })

  describe('updateWeightRecord', () => {
    it('体重記録の更新が成功する', async () => {
      const store = useWeightStore()
      const mockRecord = { id: '1', weight: 70.5, date: '2024-01-01' }
      const updatedRecord = { ...mockRecord, weight: 70.0 }
      
      store.weightRecords = [mockRecord]
      
      const { DatabaseService } = await import('@/services/firebase')
      DatabaseService.updateWeightRecord.mockResolvedValue({
        success: true,
        record: updatedRecord
      })
      
      const result = await store.updateWeightRecord('1', { weight: 70.0 })
      
      expect(result.success).toBe(true)
      expect(store.weightRecords[0]).toEqual(updatedRecord)
    })
  })

  describe('deleteWeightRecord', () => {
    it('体重記録の削除が成功する', async () => {
      const store = useWeightStore()
      const mockRecord = { id: '1', weight: 70.5, date: '2024-01-01' }
      
      store.weightRecords = [mockRecord]
      
      const { DatabaseService } = await import('@/services/firebase')
      DatabaseService.deleteWeightRecord.mockResolvedValue({
        success: true
      })
      
      const result = await store.deleteWeightRecord('1')
      
      expect(result.success).toBe(true)
      expect(store.weightRecords).toEqual([])
    })
  })

  describe('setTargetWeight', () => {
    it('目標体重が正しく設定される', () => {
      const store = useWeightStore()
      
      store.setTargetWeight(65.0)
      
      expect(store.targetWeight).toBe(65.0)
    })
  })

  describe('getWeightProgress', () => {
    it('体重の進捗が正しく計算される', () => {
      const store = useWeightStore()
      
      store.weightRecords = [
        { weight: 75.0, date: '2024-01-01' },
        { weight: 73.0, date: '2024-01-02' },
        { weight: 70.0, date: '2024-01-03' }
      ]
      store.targetWeight = 65.0
      
      const progress = store.getWeightProgress()
      
      expect(progress.totalLoss).toBe(5.0)
      expect(progress.remainingLoss).toBe(5.0)
      expect(progress.progressPercentage).toBe(0)
    })
  })
}) 