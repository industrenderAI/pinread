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
 * 3. 分类按名字去重合并，不重复插入。
 */
export async function migrateLocalToCloud(userId: string): Promise<void> {
  const flagKey = migrationFlagKey(userId)
  if (localStorage.getItem(flagKey)) return

  const [localItems, localCategories] = await Promise.all([
    localRepository.getItems(),
    localRepository.getCategories(),
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

  const cloudCategories = await cloudRepo.getCategories()
  const existingNames = new Set(cloudCategories.map((c) => c.name))

  for (const category of localCategories) {
    if (!existingNames.has(category.name)) {
      await cloudRepo.addCategory({
        id: crypto.randomUUID(),
        name: category.name,
      })

      existingNames.add(category.name)
    }
  }

  localStorage.setItem(flagKey, '1')
}