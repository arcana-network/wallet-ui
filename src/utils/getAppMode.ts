import { AppMode } from '@arcana/wallet'

enum WalletType {
  NoUI = 0,
  UI = 1,
}

const ModeWalletTypeRelation = {
  [WalletType.UI]: [AppMode.Widget, AppMode.Full],
  [WalletType.NoUI]: [AppMode.NoUI],
}

function getAppMode(w: WalletType, a: AppMode | undefined): AppMode {
  const allowedModes = ModeWalletTypeRelation[w]
  if (a !== undefined) {
    if (!allowedModes.includes(a)) {
      return allowedModes[0]
    }
    return a
  } else {
    return allowedModes[0]
  }
}

export default getAppMode
