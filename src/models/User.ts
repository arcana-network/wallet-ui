type UserInfo = {
  email: string
  name: string
  id: string
  picture: string
}

type LoginTypes = 'google' | 'twitter' | 'github'

type Auth = {
  isLoggedIn(): boolean
  loginWithSocial(loginType: LoginTypes): Promise<void>
  getUserInfo(): { privateKey: string; userInfo: UserInfo }
  logout(): Promise<void>
}

export type { UserInfo, LoginTypes, Auth }
