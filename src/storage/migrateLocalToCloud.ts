import { localRepository } from './localRepository'
import { createCloudRepository } from './cloudRepository'

function migrationFlagKey(userId: string) {
  return `pinread:migrated:${userId}`
}

/**
 * 用户登录成功后调用一次。
 *
 * 逻辑：
 * 1. 每台设备 + 每个账号只迁移一次（用 localStorage 里的一个 flag 记录），
 *    避免每次登录都重复搬运。
 * 2. 只有云端这个账号下还没有任何笔记时才搬运本地数据，避免把这台设备的
 *    本地笔记误覆盖到一个已经在别的设备上使用过的账号。
 * 3. 语言分类按名字去重合并，不重复插入默认语言。
 */
export async function migrateLocalToCloud(userId: string): Promise<void> {
  const flagKey = migrationFlagKey(userId)
  if (localStorage.getItem(flagKey)) return

  const [localItems, localLanguages] = await Promise.all([
    localRepository.getItems(),
    localRepository.getLanguages(),
  ])

  if (localItems.length === 0) {
    localStorage.setItem(flagKey, '1')
    return
  }

  const cloudRepo = createCloudRepository(userId)
  const existingCloudItems = await cloudRepo.getItems()

  if (existingCloudItems.length === 0) {
    for (const item of localItems) {
      await cloudRepo.addItem({ ...item, id: crypto.randomUUID() })
    }
  }

  const cloudLanguages = await cloudRepo.getLanguages()
  const existingNames = new Set(cloudLanguages.map((l) => l.name))
  for (const lang of localLanguages) {
    if (!existingNames.has(lang.name)) {
      await cloudRepo.addLanguage({ id: crypto.randomUUID(), name: lang.name })
      existingNames.add(lang.name)
    }
  }

  localStorage.setItem(flagKey, '1')
}
