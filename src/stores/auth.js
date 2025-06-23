import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AuthService, DatabaseService, auth } from '@/services/firebase'
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth'

export const useAuthStore = defineStore('auth', () => {
  // 状態
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)

  // ゲッター
  const isLoggedIn = computed(() => isAuthenticated.value && user.value !== null)
  const userProfile = computed(() => user.value)

  // アクション
  const login = async (credentials) => {
    try {
      isLoading.value = true
      const result = await AuthService.login(credentials.email, credentials.password)
      
      if (result.success) {
        user.value = result.user
        token.value = await result.user.getIdToken()
        isAuthenticated.value = true
        
        localStorage.setItem('token', token.value)
        localStorage.setItem('user', JSON.stringify(result.user))
        
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('ログインエラー:', error)
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData) => {
    try {
      isLoading.value = true
      const result = await AuthService.register(userData.email, userData.password, {
        username: userData.username,
        email: userData.email,
        nickname: userData.nickname || userData.username
      })
      
      if (result.success) {
        user.value = result.user
        token.value = await result.user.getIdToken()
        isAuthenticated.value = true
        
        localStorage.setItem('token', token.value)
        localStorage.setItem('user', JSON.stringify(result.user))
        
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('登録エラー:', error)
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await AuthService.logout()
      user.value = null
      token.value = null
      isAuthenticated.value = false
      
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      return { success: true }
    } catch (error) {
      console.error('ログアウトエラー:', error)
      return { success: false, error: error.message }
    }
  }

  const checkAuth = async () => {
    try {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      
      if (storedToken && storedUser) {
        // Firebaseの認証状態を確認
        return new Promise((resolve) => {
          AuthService.onAuthStateChanged((firebaseUser) => {
            if (firebaseUser) {
              user.value = firebaseUser
              token.value = storedToken
              isAuthenticated.value = true
              resolve({ success: true })
            } else {
              logout()
              resolve({ success: false })
            }
          })
        })
      } else {
        return { success: false }
      }
    } catch (error) {
      console.error('認証確認エラー:', error)
      logout()
      return { success: false, error: error.message }
    }
  }

  const updateProfile = async (profileData) => {
    try {
      if (!user.value) {
        throw new Error('ユーザーが認証されていません')
      }
      
      const result = await DatabaseService.updateUser(user.value.uid, profileData)
      
      if (result.success) {
        user.value = { ...user.value, ...profileData }
        localStorage.setItem('user', JSON.stringify(user.value))
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('プロフィール更新エラー:', error)
      return { success: false, error: error.message }
    }
  }

  const changePassword = async (currentPassword, newPassword) => {
    try {
      // Firebaseのパスワード変更機能を使用
      // 注意: 現在のパスワードの確認が必要
      const currentUser = auth.currentUser
      if (!currentUser) {
        throw new Error('ユーザーが認証されていません')
      }
      
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword)
      
      await reauthenticateWithCredential(currentUser, credential)
      await updatePassword(currentUser, newPassword)
      
      return { success: true }
    } catch (error) {
      console.error('パスワード変更エラー:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    // 状態
    user,
    token,
    isAuthenticated,
    isLoading,
    
    // ゲッター
    isLoggedIn,
    userProfile,
    
    // アクション
    login,
    register,
    logout,
    checkAuth,
    updateProfile,
    changePassword
  }
}) 