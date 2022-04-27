/**
 * @jest-environment node
 */

import { PERMISSIONS } from '@src/models/Connection'
import type { RequestMethod } from '@src/models/Connection'
import { AccountHandler } from '@src/utils/accountHandler'
import { Keeper } from '@src/utils/keeper'
import { accountHandlerTestData } from '@tests/utils.test/testData'

describe('Keeper wallet mode tests', () => {
  const accountHandler = new AccountHandler(accountHandlerTestData.privateKey)
  test('return permission required as expected in permissioned wallet', () => {
    const keeper = new Keeper(
      accountHandlerTestData.privateKey,
      PERMISSIONS,
      1,
      accountHandler
    )
    for (const p in PERMISSIONS) {
      const actual = keeper.isPermissionRequired(p as RequestMethod)
      const expected = PERMISSIONS[p]
      expect(actual).toBe(expected)
    }
  })
  test('return permission required as false in permissionless mode', () => {
    const keeper = new Keeper(
      accountHandlerTestData.privateKey,
      PERMISSIONS,
      2,
      accountHandler
    )
    for (const p in PERMISSIONS) {
      const actual = keeper.isPermissionRequired(p as RequestMethod)
      const expected = false
      expect(actual).toBe(expected)
    }
  })
})
