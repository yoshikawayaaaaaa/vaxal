# VAXAL 統合管理システム

株式会社VAXALの現場作業者向けの統合管理システム。日々の作業記録から最終的な報告書作成まで、一元的に管理するシステムです。

## 概要

### 主な目的
- 現場作業の効率化
- 情報の一元管理
- 自動レポート生成
- チーム連携の向上

### 想定利用者
- **VAXAL社員**: 注文管理・作業指示・完了確認を行う管理者
- **エンジニア**: 現場で実際の施工作業を行う作業者

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **認証**: NextAuth.js v5
- **データベース**: MySQL (Prisma ORM)
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: shadcn/ui
- **カレンダー**: react-big-calendar

## プロジェクト構造

```
app/
├── vaxal/              # VAXAL社員専用
│   ├── layout.tsx      # レイアウト（サイドバー + ヘッダー）
│   ├── page.tsx        # ダッシュボード（カレンダーにリダイレクト）
│   ├── calendar/       # カレンダー画面
│   ├── orders/         # 注文受付
│   ├── project/        # 案件詳細
│   └── profile/        # プロフィール
│
├── engineer/           # エンジニア専用
│   ├── layout.tsx      # レイアウト（サイドバー + ヘッダー）
│   ├── page.tsx        # ダッシュボード（開発中）
│   └── profile/        # プロフィール
│
├── login/              # ログイン
├── register/           # 新規登録
│   ├── page.tsx        # VAXAL社員登録
│   └── engineer/       # エンジニア登録
│
└── api/
    ├── auth/           # NextAuth.js
    ├── register/       # 登録API
    └── vaxal/          # VAXAL専用API
        ├── orders/     # 注文API
        └── projects/   # 案件API

components/
├── layout/             # レイアウトコンポーネント
│   ├── sidebar.tsx     # サイドバー
│   └── dashboard-header.tsx  # ヘッダー
├── calendar/           # カレンダーコンポーネント
├── forms/              # フォームコンポーネント
├── project/            # 案件関連コンポーネント
└── ui/                 # UIコンポーネント（shadcn/ui）

prisma/
├── schema.prisma       # データベーススキーマ
└── migrations/         # マイグレーション履歴
```

## セットアップ

### 1. 環境変数の設定

`.env.example`を`.env`にコピーして、必要な環境変数を設定してください。

```bash
cp .env.example .env
```

必要な環境変数:
- `DATABASE_URL`: MySQLデータベースのURL
- `NEXTAUTH_SECRET`: NextAuth.jsのシークレットキー
- `NEXTAUTH_URL`: アプリケーションのURL

### 2. 依存関係のインストール

```bash
npm install
```

### 3. データベースのセットアップ

```bash
# マイグレーションの実行
npx prisma migrate dev

# Prisma Clientの生成
npx prisma generate
```

### 4. テストデータの作成（オプション）

```bash
# テストユーザーの作成
npx tsx scripts/create-test-users.ts

# テストプロジェクトの作成
npx tsx scripts/create-test-projects.ts
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

## 主な機能

### VAXAL社員向け機能
- ✅ カレンダー表示（案件の一覧・詳細確認）
- ✅ 注文受付（新規案件の登録）
- ✅ 案件管理（基本情報・主要情報の編集）
- 🚧 関連情報管理（開発中）
- 🚧 詳細情報管理（開発中）

### エンジニア向け機能
- 🚧 カレンダー表示（開発中）
- 🚧 案件一覧（開発中）
- 🚧 報告機能（現場調査・工事完了報告）（開発中）
- 🚧 スタッフ管理（マスターアカウント限定）（開発中）

## データベーススキーマ

### 主要テーブル
- `VaxalUser`: VAXAL社員アカウント
- `EngineerUser`: エンジニアアカウント
- `EngineerCompany`: エンジニア会社情報
- `Project`: 案件情報
- `MainInfo`: 主要情報（元請け・VAXAL担当者・建築情報など）

詳細は `prisma/schema.prisma` を参照してください。

## 開発ガイドライン

### コーディング規約
- TypeScriptの型定義を必ず使用
- コンポーネントは機能ごとに分割
- サーバーコンポーネントとクライアントコンポーネントを適切に使い分け

### ブランチ戦略
- `main`: 本番環境
- `develop`: 開発環境
- `feature/*`: 機能開発

### コミットメッセージ
- `feat:` 新機能
- `fix:` バグ修正
- `docs:` ドキュメント
- `style:` コードスタイル
- `refactor:` リファクタリング

## ライセンス

このプロジェクトは株式会社VAXALの所有物です。

## お問い合わせ

株式会社VAXAL
