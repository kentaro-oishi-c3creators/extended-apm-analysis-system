# 拡張APM分析システム - 修正提案一覧

## バグ・不具合

### 1. ダークモード未適用のセクションが多数ある

**深刻度:** 高
**対象ファイル:**

| ファイル | 行 | 問題 |
|---------|-----|------|
| `App.tsx` | 762 | レーダーチャートセクション: `bg-white` のみ、`dark:bg-zinc-900` なし |
| `App.tsx` | 772 | レーダーチャート内側: `bg-white` のみ |
| `App.tsx` | 796, 806 | 詳細スコアテーブル: `bg-white`, `bg-zinc-50/50` にダーク対応なし |
| `App.tsx` | 840, 843-844 | テーブル行: `hover:bg-zinc-50`, `text-zinc-900` にダーク対応なし |
| `App.tsx` | 926 | 編集モーダル: 背景・入力欄・ボーダーすべてにダーク対応なし |
| `SettingsModal.tsx` | 34 | 設定モーダル全体にダーク対応なし |
| `UsageGuide.tsx` | 74 | 使い方ガイド全体にダーク対応なし |

**修正方針:** 各要素に対応する `dark:` TailwindCSSクラスを追加する。

---

### 2. 日本語テキストの誤字

**深刻度:** 低
**対象ファイル:** `App.tsx:251`

```
// Before
advice += `全体的に非常にアクティブな状態です。特トップ優先度である...`;

// After
advice += `全体的に非常にアクティブな状態です。特にトップ優先度である...`;
```

---

### 3. `editingProject` の型不整合

**深刻度:** 中
**対象ファイル:** `useProjects.ts:11`, `App.tsx:909`

**問題:**
- `useProjects.ts` で `editingProject` を `Project` 型（常にtruthy）として初期化
- `App.tsx` では `editingProject && (...)` と null チェックしている
- `setEditingProject(null)` を呼んでいるが、hook の型定義が `Project` なので `null` を受け入れない

**修正方針:** `useProjects.ts` の `editingProject` の型を `Project | null` に変更し、初期値を `null` にする。

---

### 4. 削除時の確認ダイアログの不一致

**深刻度:** 中
**対象ファイル:** `App.tsx:200`, `useProjects.ts:81-85`

**問題:**
- `useProjects.ts` の `deleteProject` → `window.confirm()` で確認あり
- `App.tsx` の `handleDelete` → 確認なしで即削除

**修正方針:** `App.tsx` の `handleDelete` に `window.confirm()` を追加するか、hook の `deleteProject` を使用するように統一する。

---

## コード品質

### 5. 未使用のインポート

**深刻度:** 低
**対象ファイル:** `App.tsx:56-57`

```typescript
// 削除すべき行
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
```

`cn` ユーティリティ (`utils/index.ts`) 経由でのみ使用しているため、直接インポートは不要。

---

### 6. 冗長なエイリアス変数

**深刻度:** 低
**対象ファイル:** `App.tsx:85-86`

```typescript
// 削除すべき行
const filterMode = filter;
const setFilterMode = setFilter;
```

`filter` / `setFilter` をそのまま使用すべき。コード内の `filterMode` / `setFilterMode` も置換が必要。

---

### 7. `handleSave` と `saveProject` のロジック重複

**深刻度:** 中
**対象ファイル:** `App.tsx:190-198`, `useProjects.ts:66-79`

**問題:**
- `App.tsx` に独自の `handleSave` を定義
- `useProjects.ts` に `saveProject` がすでに存在
- ID生成方法が異なる（`Math.random()` vs `Date.now()`）

**修正方針:** hook の `saveProject` に統一し、`App.tsx` の `handleSave` を削除する。

---

### 8. ID生成の不一致と非推奨メソッドの使用

**深刻度:** 低
**対象ファイル:** `App.tsx:194`, `useProjects.ts:75`, `App.tsx:329`

**問題:**
- `App.tsx:194` → `Math.random().toString(36).substr(2, 9)` （`substr` は非推奨）
- `useProjects.ts:75` → `Date.now().toString()`
- `App.tsx:329` → `Math.random().toString(36).substr(2, 9)`（CSVインポート時）

**修正方針:** `crypto.randomUUID()` に統一する。

---

## UX改善

### 9. モバイル対応の不足

**深刻度:** 中
**対象ファイル:** `App.tsx:388`

**問題:** ヘッダーに多数のボタン（AI連携、使い方、テーマ切替、CSV/JSON/MDエクスポート、インポート、新規追加）が横並びで配置されており、小画面で溢れる。

**修正方針:** ハンバーガーメニューまたはドロップダウンメニューでエクスポート系ボタンをまとめる。

---

### 10. Childlikeセクションのレイアウト問題

**深刻度:** 低
**対象ファイル:** `App.tsx:885`

**問題:** `<main>` タグの外に配置されており、`max-w-7xl` の制約が適用されていない。全幅で表示される。

**修正方針:** `max-w-7xl mx-auto px-6` のラッパーで囲むか、意図的なデザインであればそのまま残す。

---

### 11. アクセシビリティの欠如

**深刻度:** 中
**対象ファイル:** `App.tsx` (ヘッダーのアイコンボタン群)

**問題:**
- アイコンのみのボタンに `aria-label` がない（CSV、JSON、テーマ切替など）
- モーダルにフォーカストラップがない
- スクリーンリーダーで操作内容が判別できない

**修正方針:** 各アイコンボタンに `aria-label` 属性を追加する。

---

## 修正優先度まとめ

| 優先度 | 項目 | 理由 |
|--------|------|------|
| **高** | 1. ダークモード未適用 | ユーザーに直接影響するUI不具合 |
| **高** | 3. 型不整合 | ランタイムエラーの可能性 |
| **中** | 4. 削除確認の不一致 | データ消失リスク |
| **中** | 7. ロジック重複 | 保守性の低下 |
| **中** | 9. モバイル対応 | モバイルユーザーの利用不可 |
| **中** | 11. アクセシビリティ | ユーザビリティ |
| **低** | 2. 誤字 | 軽微な表示問題 |
| **低** | 5. 未使用インポート | コード整理 |
| **低** | 6. 冗長エイリアス | コード整理 |
| **低** | 8. ID生成統一 | コード整理 |
| **低** | 10. レイアウト | 軽微なレイアウト問題 |
