# 语言笔记

粘贴单词 / 句子 / 文章，划词加批注，像备忘录一样管理你的语言学习笔记。

## 技术栈

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- 数据层：目前用 `localStorage`（见 `src/storage/db.ts`），接口已经按照后续换成
  SQLite 的方式设计好，替换这一个文件即可，不用改其他代码

## 本地运行

```bash
npm install
npm run dev
```

浏览器打开 `http://localhost:5173` 即可看到效果。手机和电脑在同一个 WiFi 下，
也可以用电脑的局域网 IP（终端里 `npm run dev` 会打印出来）在手机浏览器里直接
打开测试。

## 项目结构

```
src/
├── types/item.ts        笔记 / 批注 / 语言分类的数据结构定义
├── storage/db.ts         数据存取（当前是 localStorage，以后换 SQLite 改这里）
├── hooks/useItems.ts     笔记的增删改查逻辑
├── components/
│   ├── ItemList.tsx       列表页（搜索、语言筛选、笔记卡片）
│   ├── ItemCard.tsx       单条笔记卡片
│   ├── NewItemSheet.tsx   新建笔记页面
│   ├── ItemDetail.tsx     详情页（划词加批注、展开/收起）
│   └── NoteModal.tsx      添加批注的底部弹窗
└── App.tsx                页面状态切换（列表 / 新建 / 详情）
```

## 接下来：打包成手机 App（Capacitor）

以下步骤需要在你自己的电脑上执行，因为要用到 Xcode（iOS）/ Android Studio
（Android），这些工具没法在这个对话环境里安装和运行。

```bash
npm install @capacitor/core @capacitor/cli
npx cap init "语言笔记" "com.yourname.languagenotes" --web-dir=dist

# 打包一次网页版
npm run build

# 添加 iOS / Android 平台（按需选择）
npm install @capacitor/ios @capacitor/android
npx cap add ios
npx cap add android

# 每次改完代码，重新构建并同步到原生项目
npm run build && npx cap sync

# 用 Xcode / Android Studio 打开原生项目，真机调试、打包
npx cap open ios
npx cap open android
```

**关于数据存储**：打包成 App 后，建议把 `src/storage/db.ts` 换成
`@capacitor-community/sqlite` 实现，这样数据存在设备本地数据库里，比
`localStorage` 更稳定、也方便以后做导出备份。存取函数的签名（`getItems`
`saveItems` 等）都不用变，上层组件和 hooks 不用动。

## 接下来：打包成桌面 App（Tauri）

同样需要在本地安装 Rust 工具链后执行：

```bash
npm install -D @tauri-apps/cli
npx tauri init
npm run build && npx tauri build
```

Tauri 会复用同一份 `dist/` 网页构建产物，打出 Mac / Windows / Linux 的原生
安装包。

## 后续可以加的功能

- 笔记编辑（现在内容创建后是只读的，只能加批注）
- 按语言分类的统计视图
- 导出笔记为文本/Markdown
- 深色模式已经跟随系统了，可以加个手动切换开关
