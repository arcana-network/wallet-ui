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

function is3PCEnabled() {
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
    const enabled = is3PCEnabled()
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
}

class UserLocalStorage extends BaseStorage {
  constructor(appId: string) {
    super('local', appId)
  }

  setUserInfo(val: UserInfo) {
    this.set(StorageKey.UserInfo, val)
  }

  getUserInfo() {
    return this.storage.get<UserInfo>(StorageKey.UserInfo)
  }

  clearUserInfo() {
    this.storage.delete(StorageKey.UserInfo)
  }

  setIsLoggedIn() {
    this.set(StorageKey.IsLoggedIn, true)
  }

  getIsLoggedIn() {
    return this.storage.get<boolean>(StorageKey.IsLoggedIn) ?? false
  }

  clearIsLoggedIn() {
    this.storage.delete(StorageKey.IsLoggedIn)
  }

  setSession(val: { sessionID: string; timestamp: number }) {
    this.set(StorageKey.Session, val)
  }

  getSession() {
    return this.storage.get<{ sessionID: string; timestamp: number }>(
      StorageKey.Session
    )
  }

  clearSession() {
    this.storage.delete(StorageKey.Session)
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
    return this.storage.get<string>(StorageKey.LoginSrc)
  }

  clearLoginSrc() {
    return this.storage.delete(StorageKey.LoginSrc)
  }

  setLoginCount(userId: string, val: number) {
    return this.set(`${userId}-${StorageKey.LoginCount}`, val)
  }

  getLoginCount(userId: string) {
    return this.storage.get<number>(`${userId}-${StorageKey.LoginCount}`)
  }

  setMFASkip(userId: string, val: number) {
    return this.set(`${userId}-${StorageKey.SkipMFAUntil}`, val)
  }

  getMFASkip(userId: string) {
    return this.storage.get<number>(`${userId}-${StorageKey.SkipMFAUntil}`)
  }

  setMFADND(userId: string) {
    return this.set(`${userId}-${StorageKey.MFADND}`, '1')
  }

  HasMFADND(userId: string) {
    return this.storage.get<string>(`${userId}-${StorageKey.MFADND}`) == '1'
  }

  setNFTList(address: string, items: NFTItem[]) {
    this.set(`${address}-${StorageKey.NFT}`, items)
  }

  getNFTList(address: string): NFTItem[] {
    return this.storage.get(`${address}-${StorageKey.NFT}`) ?? []
  }

  setAssetContractList(address: string, chainId: number, val: AssetContract[]) {
    this.storage.set(`${address}/${chainId}/${StorageKey.AssetContract}`, val)
  }

  getAssetContractList(address: string, chainId: number) {
    return (
      this.storage.get<AssetContract[]>(
        `${address}/${chainId}/${StorageKey.AssetContract}`
      ) ?? []
    )
  }

  setPK(val: { pk: string; id: string; exp: dayjs.Dayjs | undefined }) {
    this.set(StorageKey.PK, val)
  }

  getPK() {
    return this.storage.get<{
      pk: string
      id: string
      exp: dayjs.Dayjs | undefined
    }>(StorageKey.PK)
  }

  clearPK() {
    this.storage.delete(StorageKey.PK)
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
    return this.storage.get<string>(StorageKey.State)
  }

  clearState() {
    this.storage.delete(StorageKey.State)
  }

  setUserInfo(info: UserInfo) {
    this.set(StorageKey.UserInfo, info)
  }

  getUserInfo() {
    return this.storage.get<UserInfo>(StorageKey.UserInfo)
  }

  clearUserInfo() {
    this.storage.delete(StorageKey.UserInfo)
  }

  setIsLoggedIn() {
    this.set(StorageKey.IsLoggedIn, true)
  }
  clearIsLoggedIn() {
    this.storage.delete(StorageKey.IsLoggedIn)
  }
}
export {
  UserLocalStorage as LocalStorage,
  UserSessionStorage as SessionStorage,
  StorageType,
}
