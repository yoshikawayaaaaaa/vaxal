# システム簡略化・リファクタリング計画

## 目的
VAXAL側とエンジニア側のコードを分離し、システムを簡略化する

## 新しいフォルダ構造

```
app/
├── (auth)/              # 認証関連（共通）✅ 作成済み
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       ├── page.tsx     # VAXAL登録
│       └── engineer/    # エンジニア登録
│           └── page.tsx
│
├── (vaxal)/            # VAXAL専用 ✅ 作成済み
│   └── dashboard/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── calendar/
│       ├── orders/
│       ├── project/
│       └── profile/
│
├── (engineer)/         # エンジニア専用 ✅ 作成済み
│   └── dashboard/
│       ├── layout.tsx
│       ├── page.tsx
│       └── profile/
│
└── api/
    ├── auth/
    ├── register/
    │   ├── route.ts     # VAXAL登録API
    │   └── engineer/    # エンジニア登録API
    │       └── route.ts
    └── vaxal/          # VAXAL専用API
        ├── orders/
        └── projects/
```

## 移行手順

### フェーズ1: 認証関連の移動
- [ ] `app/login/page.tsx` → `app/(auth)/login/page.tsx`
- [ ] `app/register/page.tsx` → `app/(auth)/register/page.tsx`
- [ ] `app/register/engineer/page.tsx` → `app/(auth)/register/engineer/page.tsx`

### フェーズ2: VAXAL側の移動
- [ ] `app/dashboard/*` → `app/(vaxal)/dashboard/*`
  - [ ] layout.tsx
  - [ ] page.tsx
  - [ ] calendar/
  - [ ] orders/
  - [ ] project/
  - [ ] profile/

### フェーズ3: エンジニア側の整理
- [ ] `app/(engineer)/dashboard/page.tsx` 作成（開発中画面）
- [ ] `app/(engineer)/dashboard/profile/page.tsx` 作成
- [ ] `app/(engineer)/dashboard/layout.tsx` 作成

### フェーズ4: API の整理
- [ ] `app/api/orders/` → `app/api/vaxal/orders/`
- [ ] `app/api/projects/` → `app/api/vaxal/projects/`

### フェーズ5: 古いファイルの削除
- [ ] `app/dashboard/` 削除
- [ ] `app/login/` 削除
- [ ] `app/register/` 削除（engineer以外）

### フェーズ6: パスの修正
- [ ] すべてのリンクとリダイレクトを新しいパスに更新
- [ ] middleware.ts の更新

## 注意事項
- 移行は段階的に行う
- 各フェーズ後に動作確認を実施
- 古いファイルは移行完了後に削除

## 現在の状態
- ✅ フォルダ構造作成完了
- ⏸️ ファイル移動は次回実施
