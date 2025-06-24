import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth'
import { currentFirebaseConfig } from '@/config/firebase'

// Firebase初期化（エラーハンドリング付き）
let app, db, auth

try {
  app = initializeApp(currentFirebaseConfig)
  db = getFirestore(app)
  auth = getAuth(app)
} catch (error) {
  console.warn('Firebase初期化エラー:', error)
  console.log('モックモードで動作します')
}

// データベースサービス
export class DatabaseService {
  // ユーザー関連
  static async createUser(userId, userData) {
    try {
      if (!db) {
        console.log('モックモード: ユーザー作成')
        return { success: true }
      }
      
      await setDoc(doc(db, 'users', userId), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return { success: true }
    } catch (error) {
      console.error('ユーザー作成エラー:', error)
      return { success: false, error: error.message }
    }
  }

  static async getUser(userId) {
    try {
      if (!db) {
        console.log('モックモード: ユーザー取得')
        return { success: true, data: { username: 'デモユーザー', email: 'demo@example.com' } }
      }
      
      const docRef = doc(db, 'users', userId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { success: true, data: docSnap.data() }
      } else {
        return { success: false, error: 'ユーザーが見つかりません' }
      }
    } catch (error) {
      console.error('ユーザー取得エラー:', error)
      return { success: false, error: error.message }
    }
  }

  static async updateUser(userId, userData) {
    try {
      if (!db) {
        console.log('モックモード: ユーザー更新')
        return { success: true }
      }
      
      await updateDoc(doc(db, 'users', userId), {
        ...userData,
        updatedAt: serverTimestamp()
      })
      return { success: true }
    } catch (error) {
      console.error('ユーザー更新エラー:', error)
      return { success: false, error: error.message }
    }
  }

  // 体重記録
  static async getWeightRecords(userId) {
    try {
      if (!db) {
        console.log('モックモード: 体重記録取得')
        return { success: true, data: [] }
      }
      
      const q = query(
        collection(db, 'weight_records'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      const records = []
      querySnapshot.forEach((doc) => {
        records.push({ id: doc.id, ...doc.data() })
      })
      
      return { success: true, data: records }
    } catch (error) {
      console.error('体重記録取得エラー:', error)
      return { success: false, error: error.message }
    }
  }

  static async addWeightRecord(userId, recordData) {
    try {
      if (!db) {
        console.log('モックモード: 体重記録追加')
        return { success: true, id: 'mock-weight-' + Date.now() }
      }
      
      const docRef = await addDoc(collection(db, 'weight_records'), {
        userId,
        ...recordData,
        timestamp: serverTimestamp()
      })
      return { success: true, id: docRef.id }
    } catch (error) {
      console.error('体重記録追加エラー:', error)
      return { success: false, error: error.message }
    }
  }

  static async updateWeightRecord(recordId, recordData) {
    try {
      if (!db) {
        console.log('モックモード: 体重記録更新')
        return { success: true }
      }
      
      await updateDoc(doc(db, 'weight_records', recordId), {
        ...recordData,
        updatedAt: serverTimestamp()
      })
      return { success: true }
    } catch (error) {
      console.error('体重記録更新エラー:', error)
      return { success: false, error: error.message }
    }
  }

  static async deleteWeightRecord(recordId) {
    try {
      if (!db) {
        console.log('モックモード: 体重記録削除')
        return { success: true }
      }
      
      await deleteDoc(doc(db, 'weight_records', recordId))
      return { success: true }
    } catch (error) {
      console.error('体重記録削除エラー:', error)
      return { success: false, error: error.message }
    }
  }

  // 食事記録
  static async getMealRecords(userId) {
    try {
      if (!db) {
        console.log('モックモード: 食事記録取得')
        return { success: true, data: [] }
      }
      
      const q = query(
        collection(db, 'meal_records'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      const records = []
      querySnapshot.forEach((doc) => {
        records.push({ id: doc.id, ...doc.data() })
      })
      
      return { success: true, data: records }
    } catch (error) {
      console.error('食事記録取得エラー:', error)
      return { success: false, error: error.message }
    }
  }

  static async addMealRecord(userId, recordData) {
    try {
      if (!db) {
        console.log('モックモード: 食事記録追加')
        return { success: true, id: 'mock-meal-' + Date.now() }
      }
      
      const docRef = await addDoc(collection(db, 'meal_records'), {
        userId,
        ...recordData,
        timestamp: serverTimestamp()
      })
      return { success: true, id: docRef.id }
    } catch (error) {
      console.error('食事記録追加エラー:', error)
      return { success: false, error: error.message }
    }
  }

  static async updateMealRecord(recordId, recordData) {
    try {
      if (!db) {
        console.log('モックモード: 食事記録更新')
        return { success: true }
      }
      
      await updateDoc(doc(db, 'meal_records', recordId), {
        ...recordData,
        updatedAt: serverTimestamp()
      })
      return { success: true }
    } catch (error) {
      console.error('食事記録更新エラー:', error)
      return { success: false, error: error.message }
    }
  }

  static async deleteMealRecord(recordId) {
    try {
      if (!db) {
        console.log('モックモード: 食事記録削除')
        return { success: true }
      }
      
      await deleteDoc(doc(db, 'meal_records', recordId))
      return { success: true }
    } catch (error) {
      console.error('食事記録削除エラー:', error)
      return { success: false, error: error.message }
    }
  }

  // 運動記録
  static async getExerciseRecords(userId) {
    try {
      if (!db) {
        console.log('モックモード: 運動記録取得')
        return { success: true, data: [] }
      }
      
      const q = query(
        collection(db, 'exercise_records'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      const records = []
      querySnapshot.forEach((doc) => {
        records.push({ id: doc.id, ...doc.data() })
      })
      
      return { success: true, data: records }
    } catch (error) {
      console.error('運動記録取得エラー:', error)
      return { success: false, error: error.message }
    }
  }

  static async addExerciseRecord(userId, recordData) {
    try {
      if (!db) {
        console.log('モックモード: 運動記録追加')
        return { success: true, id: 'mock-exercise-' + Date.now() }
      }
      
      const docRef = await addDoc(collection(db, 'exercise_records'), {
        userId,
        ...recordData,
        timestamp: serverTimestamp()
      })
      return { success: true, id: docRef.id }
    } catch (error) {
      console.error('運動記録追加エラー:', error)
      return { success: false, error: error.message }
    }
  }

  static async updateExerciseRecord(recordId, recordData) {
    try {
      if (!db) {
        console.log('モックモード: 運動記録更新')
        return { success: true }
      }
      
      await updateDoc(doc(db, 'exercise_records', recordId), {
        ...recordData,
        updatedAt: serverTimestamp()
      })
      return { success: true }
    } catch (error) {
      console.error('運動記録更新エラー:', error)
      return { success: false, error: error.message }
    }
  }

  static async deleteExerciseRecord(recordId) {
    try {
      if (!db) {
        console.log('モックモード: 運動記録削除')
        return { success: true }
      }
      
      await deleteDoc(doc(db, 'exercise_records', recordId))
      return { success: true }
    } catch (error) {
      console.error('運動記録削除エラー:', error)
      return { success: false, error: error.message }
    }
  }

  // 設定
  static async getUserSettings(userId) {
    try {
      if (!db) {
        console.log('モックモード: 設定取得')
        return { success: true, data: {} }
      }
      
      const docRef = doc(db, 'user_settings', userId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { success: true, data: docSnap.data() }
      } else {
        return { success: true, data: {} }
      }
    } catch (error) {
      console.error('設定取得エラー:', error)
      return { success: false, error: error.message }
    }
  }

  static async updateUserSettings(userId, settings) {
    try {
      if (!db) {
        console.log('モックモード: 設定更新')
        return { success: true }
      }
      
      await setDoc(doc(db, 'user_settings', userId), {
        ...settings,
        updatedAt: serverTimestamp()
      }, { merge: true })
      return { success: true }
    } catch (error) {
      console.error('設定更新エラー:', error)
      return { success: false, error: error.message }
    }
  }

  // データエクスポート
  static async exportUserData(userId) {
    try {
      if (!db) {
        console.log('モックモード: データエクスポート')
        return {
          success: true,
          data: {
            weightRecords: [],
            mealRecords: [],
            exerciseRecords: [],
            settings: {}
          }
        }
      }
      
      const [weightResult, mealResult, exerciseResult, settingsResult] = await Promise.all([
        this.getWeightRecords(userId),
        this.getMealRecords(userId),
        this.getExerciseRecords(userId),
        this.getUserSettings(userId)
      ])

      return {
        success: true,
        data: {
          weightRecords: weightResult.success ? weightResult.data : [],
          mealRecords: mealResult.success ? mealResult.data : [],
          exerciseRecords: exerciseResult.success ? exerciseResult.data : [],
          settings: settingsResult.success ? settingsResult.data : {}
        }
      }
    } catch (error) {
      console.error('データエクスポートエラー:', error)
      return { success: false, error: error.message }
    }
  }

  // データインポート
  static async importUserData(userId, data) {
    try {
      if (!db) {
        console.log('モックモード: データインポート')
        return { success: true }
      }
      
      const batch = writeBatch(db)

      // 体重記録のインポート
      if (data.weightRecords && data.weightRecords.length > 0) {
        data.weightRecords.forEach(record => {
          const docRef = doc(collection(db, 'weight_records'))
          batch.set(docRef, { userId, ...record })
        })
      }

      // 食事記録のインポート
      if (data.mealRecords && data.mealRecords.length > 0) {
        data.mealRecords.forEach(record => {
          const docRef = doc(collection(db, 'meal_records'))
          batch.set(docRef, { userId, ...record })
        })
      }

      // 運動記録のインポート
      if (data.exerciseRecords && data.exerciseRecords.length > 0) {
        data.exerciseRecords.forEach(record => {
          const docRef = doc(collection(db, 'exercise_records'))
          batch.set(docRef, { userId, ...record })
        })
      }

      // 設定のインポート
      if (data.settings) {
        batch.set(doc(db, 'user_settings', userId), data.settings)
      }

      await batch.commit()
      return { success: true }
    } catch (error) {
      console.error('データインポートエラー:', error)
      return { success: false, error: error.message }
    }
  }
}

// 認証サービス
export class AuthService {
  static async login(email, password) {
    try {
      if (!auth) {
        throw new Error('Firebase認証が利用できません')
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return { success: true, user: userCredential.user }
    } catch (error) {
      console.error('ログインエラー:', error)
      return { success: false, error: error.message }
    }
  }

  static async register(email, password, userData) {
    try {
      if (!auth) {
        throw new Error('Firebase認証が利用できません')
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // ユーザープロフィールを作成
      await DatabaseService.createUser(userCredential.user.uid, userData)
      
      return { success: true, user: userCredential.user }
    } catch (error) {
      console.error('登録エラー:', error)
      return { success: false, error: error.message }
    }
  }

  static async logout() {
    try {
      if (!auth) {
        throw new Error('Firebase認証が利用できません')
      }
      
      await signOut(auth)
      return { success: true }
    } catch (error) {
      console.error('ログアウトエラー:', error)
      return { success: false, error: error.message }
    }
  }

  static onAuthStateChanged(callback) {
    if (!auth) {
      console.warn('Firebase認証が利用できません')
      // モックモードでは即座にコールバックを実行してリスナーを返す
      callback(null)
      return () => {} // 空のアンサブスクライブ関数
    }
    
    return onAuthStateChanged(auth, callback)
  }
}

export { auth, db } 