import type { RequestMethod } from '@/models/Request'
import type { Response } from '@/models/Response'
import type { ThemeConfig } from '@/models/Theme'

type ParentConnectionApi = {
  getThemeConfig(): ThemeConfig
  onMethodResponse(method: RequestMethod, response: Response): void
}

export type { ParentConnectionApi }
