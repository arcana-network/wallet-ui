import { GetInfoOutput } from '@arcana/auth-core'

enum StorageKey {
  UserInfo = 'userInfo',
  IsLoggedIn = 'isLoggedIn',
  SessionID = 'sessionID',
  HasMFA = 'has-mfa',
  LoginSrc = 'loginSrc',
}

type UserInfo = GetInfoOutput & {
  hasMfa?: boolean | undefined
  pk?: string | undefined
}

class UserStorage {
  private storage: IStorage
  constructor() {
    this.storage = !window.localStorage
      ? new InMemoryStorage()
      : new LocalStorage()
  }

  storeUserInfo(val: UserInfo) {
    this.storage.set(StorageKey.UserInfo, val)
  }

  getUserInfo() {
    return this.storage.get<UserInfo>(StorageKey.UserInfo)
  }

  setIsLoggedIn() {
    this.storage.set(StorageKey.IsLoggedIn, true)
  }

  getIsLoggedIn() {
    return this.storage.get<boolean>(StorageKey.IsLoggedIn) ?? false
  }

  setSession(id: string) {
    this.storage.set(StorageKey.SessionID, id)
  }

  getSession() {
    return this.storage.get<string>(StorageKey.SessionID)
  }

  setHasMFA(id: string) {
    this.storage.set(`${id}-${StorageKey.HasMFA}`, '1')
  }

  getHasMFA(id: string) {
    return this.storage.get<string>(`${id}-${StorageKey.HasMFA}`) ?? false
  }

  setLoginSrc(src: string) {
    this.storage.set(StorageKey.LoginSrc, src)
  }

  getLoginSrc() {
    return this.storage.get<string>(StorageKey.LoginSrc)
  }

  clearLoginSrc() {
    return this.storage.delete(StorageKey.LoginSrc)
  }
}

interface IStorage {
  set(key: string, value: unknown): void
  get<T>(key: string): T | null
  delete(key: string): void
}

class InMemoryStorage implements IStorage {
  private map = {}
  constructor() {
    // Add app id partitioning?
  }

  set(key: string, value: unknown) {
    this.map[key] = value
  }

  get<T>(key: string) {
    return this.map[key] as T
  }

  delete(key: string) {
    delete this.map[key]
  }
}

class LocalStorage implements IStorage {
  storage: Storage
  constructor() {
    this.storage = window.localStorage
  }

  set(key: string, value: unknown) {
    this.storage.setItem(key, JSON.stringify(value))
  }

  get<T>(key: string) {
    const val = this.storage.getItem(key)
    return val ? (JSON.parse(val) as T) : null
  }

  delete(key: string) {
    this.storage.removeItem(key)
  }
}

export { UserStorage }
