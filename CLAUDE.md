# 摄影作品平台 - 项目上下文

## 项目简介

面向摄影师的作品展示与变现平台微信小程序（uniapp + Vue3 + Pinia）。摄影师上传作品，平台审核后收录，用户可浏览、积分购买原图或申请商业授权。

---

## 技术栈

- **框架**：uniapp + Vue3 Composition API
- **状态管理**：Pinia
- **构建工具**：Vite 5
- **样式**：SCSS
- **目标平台**：微信小程序（`npm run dev:mp-weixin` / `build:mp-weixin`）

---

## 用户角色

| 角色 | 标识 | 核心权限 |
|------|------|----------|
| 买家 | `buyer` | 浏览作品、积分购买、申请授权 |
| 摄影师 | `photographer` | 上传作品、管理收益、确认授权申请 |
| 管理员 | `admin` | 审核作品、审核授权、管理用户/分类/标签/组织/角色/菜单 |

> 买家可在个人中心一键开启摄影师模式，角色升级为 `photographer`

### RBAC 权限模型（PRD v0.4）

系统引入 RBAC 模型，包含组织、角色、菜单三个维度：
- **组织**：树形结构（parent_id 自关联），用户归属一个组织（t_sys_user.org_id）
- **角色**：用户与角色多对多（t_sys_user_role），保留 t_sys_user.role 做业务快捷判断
- **菜单**：三级结构 dir → menu → button，角色与菜单多对多（t_sys_role_menu）

---

## 项目目录结构

```
docs/
├── PRD.md                # 产品需求文档（v0.4，含 RBAC）
├── api-design.md         # 后端接口设计文档
└── sql.md                # 数据库设计文档
src/
├── api/
│   ├── auth.js           # 登录、token 刷新
│   ├── photo.js          # 分类、标签、作品列表/详情/搜索、购买、下载
│   ├── studio.js         # 摄影师工作台（上传、管理、收益、授权确认）
│   ├── license.js        # 授权申请提交、详情、证书下载
│   ├── user.js           # 用户信息、积分明细、订单、授权记录
│   ├── admin.js          # 作品审核、授权审核、用户管理、分类标签、数据概览
│   └── rbac.js           # RBAC：组织/角色/菜单管理、用户角色分配
├── components/
│   ├── common/           # 通用组件（待扩展）
│   └── photo/            # 作品相关组件（待扩展）
├── constants/
│   └── index.js          # 业务枚举：USER_ROLE / PHOTO_STATUS / LICENSE_STATUS / POINTS / ...
├── pages/
│   ├── index/index.vue       # 首页瀑布流（分类筛选）
│   ├── detail/index.vue      # 作品详情（购买/下载/申请授权）
│   ├── search/index.vue      # 搜索（关键词 + 分类筛选）
│   ├── login/index.vue       # 微信一键登录
│   ├── photographer/index.vue # 摄影师主页
│   ├── mine/
│   │   ├── index.vue         # 个人中心
│   │   ├── orders.vue        # 我的订单
│   │   └── licenses.vue      # 我的授权申请
│   ├── license/
│   │   └── apply.vue         # 申请授权表单
│   ├── studio/
│   │   ├── index.vue         # 摄影师工作台首页
│   │   ├── upload.vue        # 上传作品
│   │   ├── works.vue         # 我的作品（含状态筛选）
│   │   ├── edit.vue          # 编辑作品
│   │   └── earnings.vue      # 积分收益明细
│   └── admin/
│       ├── index.vue         # 管理后台首页（数据概览）
│       ├── works.vue         # 待审核作品列表
│       ├── work-review.vue   # 作品审核详情
│       ├── licenses.vue      # 待审核授权列表
│       ├── license-review.vue # 授权审核详情
│       ├── users.vue         # 用户管理
│       ├── categories.vue    # 分类标签管理
│       ├── orgs.vue          # 组织管理（RBAC）
│       ├── roles.vue         # 角色管理（RBAC）
│       └── menus.vue         # 菜单管理（RBAC）
├── store/
│   ├── user.js           # 用户信息、角色、积分、登录/登出
│   └── photo.js          # 首页作品列表、分类、分页
├── utils/
│   ├── request.js        # uni.request 封装（双 token 刷新、错误 toast、支持 GET/POST/PUT/PATCH/DELETE）
│   ├── auth.js           # 微信登录流程、token 存取、requireLogin 守卫
│   └── upload.js         # 图片压缩 + OSS 直传
├── App.vue
├── main.js               # createSSRApp + Pinia
├── pages.json            # 页面路由 + tabBar 配置
├── manifest.json         # 小程序 appid 等配置
└── uni.scss              # 全局样式变量
```

---

## 业务常量（constants/index.js）

```js
USER_ROLE:      buyer / photographer / admin
PHOTO_STATUS:   pending / approved / rejected / offline
LICENSE_STATUS: pending_admin / pending_photographer / approved / rejected
POINTS.RATIO:   1元 = 10积分
POINTS.MIN_PRICE: 10
POINTS.MAX_PRICE: 9999
LICENSE_PURPOSE: commercial / news / personal / education / other
STORAGE_KEY:    access_token / refresh_token / user_info
```

---

## 核心业务流程

### 登录
```
wx.login() → code → POST /auth/wx-login → { accessToken, refreshToken, user }
→ 存入 Storage → 写入 Pinia userStore
```

### 作品上传（摄影师）
```
选图 → 压缩预览图（800px/80%）+ 原图
→ GET /upload/signature 获取 OSS 签名（分别获取 preview 和 original）
→ uni.uploadFile 直传 OSS → POST /studio/photos 提交作品信息（含 previewKey + originalKey）
→ 状态变为 pending，等待管理员审核
```

### 积分购买
```
点击购买 → 校验积分余额 → POST /photos/:id/buy → 购买成功
→ GET /photos/:id/download 获取原图临时链接 → 保存到相册
```

### 授权申请
```
填写用途/场景(scene)/期限 → POST /licenses
→ 管理员审核（pending_admin）→ 通过后摄影师确认（pending_photographer）
→ 摄影师通过 → 状态变为 approved → 用户可下载授权证书
```

---

## API 路径约定

| 模块 | 前缀 | 说明 |
|------|------|------|
| 公开作品 | `/photos` | 列表、详情、搜索、购买、下载 |
| 分类标签 | `/categories` | 分类列表、`/categories/:id/tags` 获取标签 |
| 摄影师工作台 | `/studio` | 上传、管理、收益、授权确认 |
| 个人中心 | `/user` | 信息、积分明细(`/user/points-history`)、订单、授权记录 |
| 管理后台 | `/admin` | 审核、用户管理、分类标签 |
| RBAC 管理 | `/admin/orgs` `/admin/roles` `/admin/menus` | 组织/角色/菜单 CRUD |
| 用户角色分配 | `/admin/users/:id/roles` `/admin/users/:id/org` | 角色分配、组织归属 |
| 授权申请 | `/licenses` | 提交申请、详情、证书下载(`/licenses/:id/certificate`) |
| 认证 | `/auth` | 登录、刷新 token |
| 上传签名 | `/upload/signature` | OSS 直传签名 |

### HTTP 方法约定

- 状态变更类接口使用 `PATCH`（上下架、审核、封禁/解封、启用/禁用）
- 全量更新使用 `PUT`（编辑作品、编辑角色、设置用户角色等）
- `http` 工具支持：`get` / `post` / `put` / `patch` / `delete`

---

## 环境变量

| 变量 | 说明 |
|------|------|
| `VITE_API_BASE_URL` | 后端接口基础地址（开发：`http://localhost:8080`） |

配置文件：`.env.development` / `.env.production`

---

## 关键技术决策

- 图片预览用**低分辨率预览图**（800px 宽、质量 80%），原图仅购买/授权后可获取；原图不限大小
- 预览图水印使用 **OSS 图片处理**规则自动添加（平台名称 + 作品ID）
- Token 采用 accessToken（2h）+ refreshToken（7d）双 token，自动无感刷新
- 图片上传走 **OSS 直传**（后端提供签名），减少服务器带宽；每张图分别上传预览图和原图
- 货币单位：**积分**（1元=10积分），全程整数传输；积分定价范围 10 ~ 9999
- 平台积分抽佣 **10%**，摄影师实得 90%
- 授权流程需**管理员 + 摄影师双重确认**；授权使用期限为自由填写
- 有购买记录的作品可修改定价，仅影响后续购买
- RBAC 权限通过 `t_sys_user_role` + `t_sys_role_menu` 关联表维护，`t_sys_user.role` 保留做业务快捷判断

---

## 开发注意事项

- 新增页面必须同步更新 `src/pages.json`
- tabBar 页面（index/search/mine）使用 `uni.switchTab`，其他页面用 `uni.navigateTo`
- 需要登录的操作调用 `requireLogin()`（utils/auth.js），未登录自动跳转登录页
- 摄影师/管理员专属页面在 `onMounted` 中校验 `userStore.isPhotographer` / `userStore.isAdmin`
- 接口字段变更优先更新 `api/` 模块，不在页面内临时处理
- 状态变更接口（审核、封禁、上下架、启用/禁用）统一使用 `http.patch`
- RBAC 相关 API 集中在 `api/rbac.js`，管理后台业务 API 在 `api/admin.js`
- sass 废弃警告（legacy-js-api）不影响编译，可忽略
