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
  const isMockMode = ref(false)
  const isFirstLogin = ref(false)
  const isInitialized = ref(false) // 初期化完了フラグ

  // ゲッター
  const isLoggedIn = computed(() => isAuthenticated.value && user.value !== null)
  const userProfile = computed(() => user.value)
  
  // 初回ログイン判定
  const needsOnboarding = computed(() => {
    if (!isAuthenticated.value) return false
    
    // プロフィール設定と目標設定が完了しているかチェック
    const settings = JSON.parse(localStorage.getItem('user_settings') || '{}')
    const hasProfile = settings.nickname && settings.age && settings.gender && settings.height
    const hasGoals = settings.targetWeight && settings.dailyCalorieGoal
    
    return !hasProfile || !hasGoals
  })

  // モックユーザーデータ
  const mockUser = {
    uid: 'mock-user-id',
    email: 'demo@example.com',
    displayName: 'デモユーザー',
    photoURL: null
  }

  // アクション
  const login = async (credentials) => {
    try {
      isLoading.value = true
      
      // Firebaseが利用できない場合はモックモードで動作
      if (!auth || !auth.currentUser) {
        // デモログイン（任意のメール/パスワードでログイン可能）
        if (credentials.email && credentials.password) {
          user.value = mockUser
          token.value = 'mock-token-' + Date.now()
          isAuthenticated.value = true
          isMockMode.value = true
          
          localStorage.setItem('token', token.value)
          localStorage.setItem('user', JSON.stringify(mockUser))
          localStorage.setItem('mockMode', 'true')
          
          // 初回ログイン判定
          checkFirstLogin()
          
          return { success: true }
        } else {
          return { success: false, error: 'メールアドレスとパスワードを入力してください' }
        }
      }

      // 通常のFirebase認証
      const result = await AuthService.login(credentials.email, credentials.password)
      
      if (result.success) {
        user.value = result.user
        token.value = await result.user.getIdToken()
        isAuthenticated.value = true
        isMockMode.value = false
        
        localStorage.setItem('token', token.value)
        localStorage.setItem('user', JSON.stringify(result.user))
        localStorage.removeItem('mockMode')
        
        // 初回ログイン判定
        checkFirstLogin()
        
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
      
      // Firebaseが利用できない場合はモックモードで動作
      if (!auth || !auth.currentUser) {
        user.value = {
          ...mockUser,
          email: userData.email,
          displayName: userData.nickname || userData.username
        }
        token.value = 'mock-token-' + Date.now()
        isAuthenticated.value = true
        isMockMode.value = true
        
        localStorage.setItem('token', token.value)
        localStorage.setItem('user', JSON.stringify(user.value))
        localStorage.setItem('mockMode', 'true')
        
        // 新規登録は初回ログイン
        isFirstLogin.value = true
        
        return { success: true }
      }

      // 通常のFirebase認証
      const result = await AuthService.register(userData.email, userData.password, {
        username: userData.username,
        email: userData.email,
        nickname: userData.nickname || userData.username
      })
      
      if (result.success) {
        user.value = result.user
        token.value = await result.user.getIdToken()
        isAuthenticated.value = true
        isMockMode.value = false
        
        localStorage.setItem('token', token.value)
        localStorage.setItem('user', JSON.stringify(result.user))
        localStorage.removeItem('mockMode')
        
        // 新規登録は初回ログイン
        isFirstLogin.value = true
        
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
      if (!isMockMode.value && auth) {
        await AuthService.logout()
      }
      
      user.value = null
      token.value = null
      isAuthenticated.value = false
      isMockMode.value = false
      isFirstLogin.value = false
      
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('mockMode')
      
      return { success: true }
    } catch (error) {
      console.error('ログアウトエラー:', error)
      return { success: false, error: error.message }
    }
  }

  const checkAuth = async () => {
    // 既に初期化済みの場合はスキップ
    if (isInitialized.value) {
      return { success: isAuthenticated.value }
    }

    try {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      const mockMode = localStorage.getItem('mockMode')
      
      if (storedToken && storedUser) {
        if (mockMode === 'true') {
          // モックモード
          user.value = JSON.parse(storedUser)
          token.value = storedToken
          isAuthenticated.value = true
          isMockMode.value = true
          
          // 初回ログイン判定
          checkFirstLogin()
          
          isInitialized.value = true
          return { success: true }
        } else {
          // Firebase認証
          if (auth) {
            // Firebase認証状態を確認
            const currentUser = auth.currentUser
            if (currentUser) {
              user.value = currentUser
              token.value = storedToken
              isAuthenticated.value = true
              isMockMode.value = false
              
              // 初回ログイン判定
              checkFirstLogin()
              
              isInitialized.value = true
              return { success: true }
            } else {
              // Firebase認証状態が無効な場合
              console.log('Firebase認証状態が無効です')
              logout()
              isInitialized.value = true
              return { success: false }
            }
          } else {
            // Firebaseが利用できない場合
            console.log('Firebaseが利用できません')
            logout()
            isInitialized.value = true
            return { success: false }
          }
        }
      }
      
      // 認証情報がない場合は未認証状態
      user.value = null
      token.value = null
      isAuthenticated.value = false
      isMockMode.value = false
      isFirstLogin.value = false
      isInitialized.value = true
      
      return { success: false }
    } catch (error) {
      console.error('認証確認エラー:', error)
      // エラー時は未認証状態にリセット
      user.value = null
      token.value = null
      isAuthenticated.value = false
      isMockMode.value = false
      isFirstLogin.value = false
      isInitialized.value = true
      
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('mockMode')
      
      return { success: false, error: error.message }
    }
  }

  // 初回ログイン判定
  const checkFirstLogin = () => {
    const settings = JSON.parse(localStorage.getItem('user_settings') || '{}')
    const hasProfile = settings.nickname && settings.age && settings.gender && settings.height
    const hasGoals = settings.targetWeight && settings.dailyCalorieGoal
    
    isFirstLogin.value = !hasProfile || !hasGoals
  }

  // オンボーディング完了
  const completeOnboarding = () => {
    console.log('認証ストア: オンボーディング完了処理を開始')
    console.log('現在のisFirstLogin:', isFirstLogin.value)
    isFirstLogin.value = false
    console.log('isFirstLoginをfalseに設定しました')
    console.log('needsOnboardingの値:', needsOnboarding.value)
  }

  const updateProfile = async (profileData) => {
    try {
      if (!user.value) {
        throw new Error('ユーザーが認証されていません')
      }
      
      if (isMockMode.value) {
        // モックモードではローカルストレージのみ更新
        user.value = { ...user.value, ...profileData }
        localStorage.setItem('user', JSON.stringify(user.value))
        return { success: true }
      }
      
      // 通常のFirebase更新
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
      if (isMockMode.value) {
        // モックモードでは常に成功
        return { success: true }
      }
      
      // Firebaseのパスワード変更機能を使用
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
    isMockMode,
    isFirstLogin,
    isInitialized,
    
    // ゲッター
    isLoggedIn,
    userProfile,
    needsOnboarding,
    
    // アクション
    login,
    register,
    logout,
    checkAuth,
    checkFirstLogin,
    completeOnboarding,
    updateProfile,
    changePassword
  }
}) 