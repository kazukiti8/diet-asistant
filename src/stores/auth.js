import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // 状態
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const isAuthenticated = ref(false)

  // ゲッター
  const isLoggedIn = computed(() => isAuthenticated.value && user.value !== null)
  const userProfile = computed(() => user.value)

  // アクション
  const login = async (credentials) => {
    try {
      // 実際のAPI呼び出しをここに実装
      const response = await mockLoginAPI(credentials)
      
      user.value = response.user
      token.value = response.token
      isAuthenticated.value = true
      
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      return { success: true }
    } catch (error) {
      console.error('ログインエラー:', error)
      return { success: false, error: error.message }
    }
  }

  const register = async (userData) => {
    try {
      // 実際のAPI呼び出しをここに実装
      const response = await mockRegisterAPI(userData)
      
      user.value = response.user
      token.value = response.token
      isAuthenticated.value = true
      
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      return { success: true }
    } catch (error) {
      console.error('登録エラー:', error)
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    isAuthenticated.value = false
    
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const checkAuth = async () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      try {
        // 実際のAPI呼び出しでトークンの有効性を確認
        const response = await mockValidateTokenAPI(storedToken)
        
        if (response.valid) {
          user.value = JSON.parse(storedUser)
          token.value = storedToken
          isAuthenticated.value = true
        } else {
          logout()
        }
      } catch (error) {
        console.error('認証確認エラー:', error)
        logout()
      }
    }
  }

  const updateProfile = async (profileData) => {
    try {
      // 実際のAPI呼び出しをここに実装
      const response = await mockUpdateProfileAPI(profileData)
      
      user.value = { ...user.value, ...response.user }
      localStorage.setItem('user', JSON.stringify(user.value))
      
      return { success: true }
    } catch (error) {
      console.error('プロフィール更新エラー:', error)
      return { success: false, error: error.message }
    }
  }

  // モックAPI関数（実際の開発では削除）
  const mockLoginAPI = async (credentials) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          user: {
            id: 1,
            username: credentials.username,
            email: 'user@example.com',
            nickname: 'ダイエット頑張る',
            createdAt: new Date().toISOString()
          },
          token: 'mock-jwt-token'
        })
      }, 1000)
    })
  }

  const mockRegisterAPI = async (userData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          user: {
            id: 1,
            username: userData.username,
            email: userData.email,
            nickname: userData.nickname || userData.username,
            createdAt: new Date().toISOString()
          },
          token: 'mock-jwt-token'
        })
      }, 1000)
    })
  }

  const mockValidateTokenAPI = async (token) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ valid: true })
      }, 500)
    })
  }

  const mockUpdateProfileAPI = async (profileData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          user: profileData
        })
      }, 1000)
    })
  }

  return {
    // 状態
    user,
    token,
    isAuthenticated,
    
    // ゲッター
    isLoggedIn,
    userProfile,
    
    // アクション
    login,
    register,
    logout,
    checkAuth,
    updateProfile
  }
}) 