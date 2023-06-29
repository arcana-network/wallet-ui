import { GetInfoOutput } from '@arcana/auth-core'
import dayjs from 'dayjs'

import { AssetContract } from '@/models/Asset'
import { NFT } from '@/models/NFT'

enum StorageKey {
  UserInfo = 'userInfo',
  IsLoggedIn = 'isLoggedIn',
  Session = 'session',
  HasMFA = 'has-mfa',
  SkipMFAUntil = 'mfa-skip-until',
  MFADND = 'mfa-dnd',
  LoginSrc = 'loginSrc',
  LoginCount = 'login-count',
  State = 'state',
  NFT = 'nft_list',
  AssetContract = 'asset-contracts',
  PK = 'pk',
}

type UserInfo = GetInfoOutput & {
  hasMfa?: boolean | undefined
  pk?: string | undefined
}

type NFTItem = NFT & {
  autodetected: boolean
  chainId: number
}

function are3PCEnabled() {
  let enabled = false
  try {
    const storage = window.localStorage
    storage.setItem('_', '_')
    enabled = storage.getItem('_') === '_'
  } catch (e) {
    console.log(
      "Local or session storage doesn't work, falling back to In-Memory storage.",
      e
    )
  }
  return enabled
}

enum StorageType {
  BROWSER,
  IN_MEMORY,
}

class BaseStorage {
  public storageType: StorageType
  protected storage: IStorage
  private appId: string
  constructor(type: 'local' | 'session', appId: string) {
    const enabled = are3PCEnabled()
    this.storage = enabled
      ? type == 'local'
        ? new LocalStorage()
        : new SessionStorage()
      : new InMemoryStorage()
    this.storageType = enabled ? StorageType.BROWSER : StorageType.IN_MEMORY
    this.appId = appId
  }

  set(key: string, val: unknown) {
    this.storage.set(`${this.appId}-${key}`, val)
  }

  get<T>(key: string) {
    return this.storage.get(`${this.appId}-${key}`) as T
  }

  delete(key: string) {
    this.storage.delete(`${this.appId}-${key}`)
  }
}

class UserLocalStorage extends BaseStorage {
  constructor(appId: string) {
    super('local', appId)
  }

  setUserInfo(val: UserInfo) {
    this.set(StorageKey.UserInfo, val)
  }

  getUserInfo() {
    return this.get<UserInfo>(StorageKey.UserInfo)
  }

  clearUserInfo() {
    this.delete(StorageKey.UserInfo)
  }

  setIsLoggedIn() {
    this.set(StorageKey.IsLoggedIn, true)
  }

  getIsLoggedIn() {
    return this.get<boolean>(StorageKey.IsLoggedIn) ?? false
  }

  clearIsLoggedIn() {
    this.delete(StorageKey.IsLoggedIn)
  }

  setSession(val: { sessionID: string; timestamp: number }) {
    this.set(StorageKey.Session, val)
  }

  getSession() {
    return this.get<{ sessionID: string; timestamp: number }>(
      StorageKey.Session
    )
  }

  clearSession() {
    this.delete(StorageKey.Session)
  }

  setHasMFA(id: string) {
    this.set(`${id}-${StorageKey.HasMFA}`, '1')
  }

  getHasMFA(id: string) {
    return this.storage.get<string>(`${id}-${StorageKey.HasMFA}`) == '1'
  }

  setLoginSrc(src: string) {
    this.set(StorageKey.LoginSrc, src)
  }

  getLoginSrc() {
    return this.get<string>(StorageKey.LoginSrc)
  }

  clearLoginSrc() {
    return this.delete(StorageKey.LoginSrc)
  }

  setLoginCount(userId: string, val: number) {
    return this.set(`${userId}-${StorageKey.LoginCount}`, val)
  }

  incrementLoginCount(userId: string) {
    let loginCount = this.getLoginCount(userId)
    loginCount = loginCount ? Number(loginCount) + 1 : 1
    this.setLoginCount(userId, loginCount)
  }

  getLoginCount(userId: string) {
    return this.get<number>(`${userId}-${StorageKey.LoginCount}`)
  }

  setMFASkip(userId: string, val: number) {
    return this.set(`${userId}-${StorageKey.SkipMFAUntil}`, val)
  }

  getMFASkip(userId: string) {
    return this.get<number>(`${userId}-${StorageKey.SkipMFAUntil}`)
  }

  setMFADND(userId: string) {
    return this.set(`${userId}-${StorageKey.MFADND}`, '1')
  }

  HasMFADND(userId: string) {
    return this.get<string>(`${userId}-${StorageKey.MFADND}`) == '1'
  }

  setNFTList(address: string, items: NFTItem[]) {
    this.set(`${address}-${StorageKey.NFT}`, items)
  }

  getNFTList(address: string): NFTItem[] {
    return this.get(`${address}-${StorageKey.NFT}`) ?? []
  }

  setAssetContractList(address: string, chainId: number, val: AssetContract[]) {
    this.set(`${address}/${chainId}/${StorageKey.AssetContract}`, val)
  }

  getAssetContractList(address: string, chainId: number) {
    return (
      this.get<AssetContract[]>(
        `${address}/${chainId}/${StorageKey.AssetContract}`
      ) ?? []
    )
  }

  setPK(val: { pk: string; id: string; exp: dayjs.Dayjs | undefined }) {
    this.set(StorageKey.PK, val)
  }

  getPK() {
    return this.get<{
      pk: string
      id: string
      exp: dayjs.Dayjs | undefined
    }>(StorageKey.PK)
  }

  clearPK() {
    this.delete(StorageKey.PK)
  }
}

interface IStorage {
  set(key: string, value: unknown): void
  get<T>(key: string): T | null
  delete(key: string): void
}

class InMemoryStorage implements IStorage {
  private map = new Map<string, unknown>()
  constructor() {
    // Add app id partitioning?
  }

  set(key: string, value: unknown) {
    this.map.set(key, value)
  }

  get<T>(key: string) {
    return (this.map.get(key) as T) ?? null
  }

  delete(key: string) {
    this.map.delete(key)
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

class SessionStorage implements IStorage {
  storage: Storage
  constructor() {
    this.storage = window.sessionStorage
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

class UserSessionStorage extends BaseStorage {
  constructor(appId: string) {
    super('session', appId)
  }

  setState(state: string) {
    this.set(StorageKey.State, state)
  }

  getState() {
    return this.get<string>(StorageKey.State)
  }

  clearState() {
    this.delete(StorageKey.State)
  }

  setUserInfo(info: UserInfo) {
    this.set(StorageKey.UserInfo, info)
  }

  getUserInfo() {
    return this.get<UserInfo>(StorageKey.UserInfo)
  }

  clearUserInfo() {
    this.delete(StorageKey.UserInfo)
  }

  getIsLoggedIn() {
    return this.get<boolean>(StorageKey.IsLoggedIn) ?? false
  }

  setIsLoggedIn() {
    this.set(StorageKey.IsLoggedIn, true)
  }
  clearIsLoggedIn() {
    this.delete(StorageKey.IsLoggedIn)
  }
}
export {
  UserLocalStorage as LocalStorage,
  UserSessionStorage as SessionStorage,
  StorageType,
}
