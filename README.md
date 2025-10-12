# VAXAL 管理システム

株式会社VAXAL向けの現場作業者統合管理システム

## 概要

日々の作業記録から最終的な報告書作成まで、一元的に管理するシステムです。

### 主な機能

- **現場作業の効率化**: スマートフォンから簡単に作業記録を登録・管理
- **情報の一元管理**: 案件情報、スケジュール、報告書を一箇所で管理
- **自動レポート生成**: 写真付きの報告書を自動生成し、業務を効率化
- **チーム連携の向上**: リアルタイムでの情報共有と進捗管理

### 想定利用者

- **VAXAL社員**: 注文管理・作業指示・完了確認を行う管理者
- **エンジニア(マスター)**: 会社の代表者として案件を受注・管理
- **エンジニア(スタッフ)**: 現場で実際の施工作業を行う作業者

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **データベース**: MySQL (Prisma ORM)
- **認証**: NextAuth.js v5
- **UI**: Tailwind CSS + Radix UI
- **フォーム**: React Hook Form + Zod

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example`を`.env`にコピーして、必要な環境変数を設定してください。

```bash
cp .env.example .env
```

必要な環境変数:
- `DATABASE_URL`: MySQLデータベースのURL (例: mysql://user:password@localhost:3306/vaxal_db)
- `NEXTAUTH_URL`: アプリケーションのURL (開発環境: http://localhost:3000)
- `NEXTAUTH_SECRET`: NextAuthのシークレットキー

### 3. データベースのセットアップ

```bash
# Prismaクライアントの生成
npx prisma generate

# データベースマイグレーション
npx prisma migrate dev --name init

# (オプション) Prisma Studioでデータベースを確認
npx prisma studio
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

## プロジェクト構造

```
vaxal/
├── app/                      # Next.js App Router
│   ├── api/                  # APIルート
│   │   └── auth/            # NextAuth認証エンドポイント
│   ├── dashboard/           # ダッシュボード画面
│   │   ├── calendar/        # カレンダー機能
│   │   ├── projects/        # 案件管理
│   │   ├── reports/         # 報告書機能
│   │   ├── database/        # データベース管理(VAXAL社員のみ)
│   │   └── settings/        # 設定画面
│   ├── login/               # ログイン画面
│   ├── register/            # 登録画面
│   └── page.tsx             # トップページ
├── components/              # Reactコンポーネント
│   └── ui/                  # UIコンポーネント
├── lib/                     # ユーティリティ関数
│   ├── prisma.ts           # Prismaクライアント
│   └── utils.ts            # 共通ユーティリティ
├── prisma/                  # Prismaスキーマ
│   └── schema.prisma       # データベーススキーマ定義
├── types/                   # TypeScript型定義
│   └── next-auth.d.ts      # NextAuth型拡張
├── auth.ts                  # NextAuth設定
├── auth.config.ts          # NextAuth認証設定
└── middleware.ts           # Next.jsミドルウェア
```

## 主要機能

### 1. 認証システム
- メールアドレスとパスワードによるログイン
- ロールベースのアクセス制御 (VAXAL社員/エンジニアマスター/エンジニアスタッフ)

### 2. カレンダー機能
- 確定予定(青)と対応可能日(緑)の管理
- 工事日程の可視化

### 3. 案件管理
- 施主基本情報の管理
- 工事内容・商品情報の記録
- 支払い情報の管理
- 各種メモ・指示の記録

### 4. 報告書機能
- 現場調査報告
- 集荷報告
- check in報告
- 工事完了報告
- 荷卸し報告

### 5. ファイル管理
- 写真のアップロード
- カテゴリ別のファイル整理

## データベーススキーマ

主要なモデル:
- **User**: ユーザー情報(VAXAL社員/エンジニア)
- **Company**: 会社情報(エンジニアマスターアカウント)
- **Project**: 案件情報
- **CalendarEvent**: カレンダーイベント
- **Report**: 各種報告書
- **ProjectFile/ReportFile**: ファイル管理

詳細は `prisma/schema.prisma` を参照してください。

## 開発ガイドライン

### コーディング規約
- TypeScriptの型を適切に使用
- コンポーネントは機能ごとに分割
- サーバーコンポーネントとクライアントコンポーネントを適切に使い分け

### コミット規約
- feat: 新機能
- fix: バグ修正
- docs: ドキュメント更新
- style: コードスタイルの変更
- refactor: リファクタリング
- test: テスト追加・修正
- chore: ビルド・設定変更

## ライセンス

Private - 株式会社VAXAL専用

## サポート

問題が発生した場合は、開発チームまでお問い合わせください。
