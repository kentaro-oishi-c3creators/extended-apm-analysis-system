# 拡張APM分析システム - 詳細コードレビュー（第2回）

> レビュー日: 2026-02-23
> レビュアー: Claude Opus 4

---

## 修正済み項目（対象外）

以下は第1回レビューで修正済みのため、本レビューでは除外しています：

- ダークモード対応（全コンポーネント）
- Tailwind v4 dark variant 設定
- editingProject 型不整合
- handleSave/saveProject 統一
- filterMode エイリアス削除
- 未使用インポート整理
- ID生成統一（crypto.randomUUID）
- 削除確認ダイアログ
- モバイルレスポンシブヘッダー
- aria-label 追加
- 誤字修正

---

## 1. ランタイムバグ・エッジケース

### 1.1 [Critical] CalculatedProject のフィールドが保存時に混入する

**ファイル:** `useProjects.ts:69`, `App.tsx:613`

**問題:**
プロジェクトリストからクリックで編集する際、`filteredProjects` の要素は `CalculatedProject` 型（`qwi`, `lii`, `msi`, `priorityScore` を含む）。
`setEditingProject(p)` でこれがセットされ、保存時にこれら計算フィールドが `projects` 配列に混入する。
JSON/CSVエクスポートに古い計算値が含まれ、データが汚染される。

**修正案:**
```typescript
const saveProject = (project: Project) => {
    const { qwi, lii, msi, priorityScore, ...cleanProject } = project as any;
    if (cleanProject.id) {
        setProjects(prev => prev.map(p => p.id === cleanProject.id ? cleanProject : p));
    } else {
        setProjects(prev => [...prev, { ...cleanProject, id: crypto.randomUUID() }]);
    }
    setIsAdding(false);
    setEditingProject(null);
};
```

---

### 1.2 [High] localStorage の JSON.parse がエラーハンドリングされていない

**ファイル:** `useProjects.ts:6-8`

**問題:**
`JSON.parse(saved)` は破損データで例外を投げ、アプリ全体がクラッシュする。復旧手段がない。

**修正案:**
```typescript
const [projects, setProjects] = useState<Project[]>(() => {
    try {
        const saved = localStorage.getItem('apm_projects');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch (e) {
        console.error('Failed to parse saved projects:', e);
        localStorage.removeItem('apm_projects');
    }
    return DEFAULT_PROJECTS;
});
```

---

### 1.3 [Medium] handleClearAll で overallAdvice がクリアされない

**ファイル:** `App.tsx:188-193`

**問題:** 全プロジェクト削除後、`overallAdvice` に削除済みプロジェクトへの言及が残る。

**修正案:** `handleClearAll` 内に `setOverallAdvice('')` を追加。

---

### 1.4 [Medium] recommendations.discard が他の推奨と同一プロジェクトになりうる

**ファイル:** `App.tsx:167-180`

**問題:** `discard` のフォールバック（`sortedByEffort[0]`）が `startNow` や `quickWin` と同一プロジェクトになるケースがあり、「着手すべき」と「捨てるべき」に同一プロジェクトが表示される矛盾が発生する。

**修正案:** 既に推奨された項目を `discard` 候補から除外する。

---

### 1.5 [Medium] CSV import で数値のバリデーションがない

**ファイル:** `App.tsx:275-323`

**問題:** `parseInt(val) || 0` のみで、1-10 の範囲や progress の 0-100 範囲が検証されない。`impact: 999` のようなデータがそのまま取り込まれ、チャートが破綻する。

**修正案:**
```typescript
if (['impact', 'effort', 'mentalDrain', 'excitement', 'convexity'].includes(h)) {
    p[h] = Math.max(1, Math.min(10, parseInt(val) || 5));
} else if (h === 'progress') {
    p[h] = Math.max(0, Math.min(100, parseInt(val) || 0));
}
```

---

### 1.6 [Medium] CSV import の any 型キャストと不完全なパーサー

**ファイル:** `App.tsx:303, 314`

**問題:** `const p: any = {}` → `return p as Project` で型安全性が完全にバイパスされる。必須フィールドが欠落したオブジェクトが生成されうる。

**修正案:** デフォルト値を持つ `Project` オブジェクトを基盤にして上書きする。

---

## 2. エラーハンドリング

### 2.1 [Medium] React Error Boundary がない

**ファイル:** `main.tsx`

**問題:** レンダリング中に例外が発生すると白い画面になり、復旧不可能。

**修正案:** Error Boundary コンポーネントを追加し、localStorage クリア & リスタートの UI を提供。

---

### 2.2 [Low] navigator.clipboard が未定義の場合のフォールバック

**ファイル:** `App.tsx:355-363`

**問題:** HTTP 環境では `navigator.clipboard` が `undefined` になり、`writeText` を呼ぶ前に TypeError が発生する。

**修正案:** `navigator.clipboard?.writeText` で guard し、フォールバックとして `document.execCommand('copy')` を使用。

---

## 3. 型安全性

### 3.1 [Medium] Slider の icon prop が any 型

**ファイル:** `Slider.tsx:9`

**修正案:** `LucideIcon` 型を使用：
```typescript
import { type LucideIcon } from 'lucide-react';
interface SliderProps { icon: LucideIcon; ... }
```

---

### 3.2 [Low] AXES の key が Project フィールドとの対応を保証しない

**ファイル:** `constants/index.ts:4-10`

**修正案:** `NumericProjectKey` 型を定義して制約する。

---

## 4. セキュリティ

### 4.1 [Medium] CSV エクスポートの CSV injection 脆弱性

**ファイル:** `App.tsx:262-273`

**問題:** プロジェクト名が `=cmd|'/C calc'!A0` のような値の場合、エクスポートしたCSVをExcelで開くと数式として実行される。

**修正案:**
```typescript
const sanitizeCsvValue = (val: string) => {
    if (/^[=+\-@\t\r]/.test(val)) return `'${val}`;
    return val;
};
```

---

### 4.2 [Low] react-markdown の XSS 耐性の将来リスク

**ファイル:** `App.tsx:674, 1123`

**問題:** 現行の react-markdown は HTML をデフォルトでストリップするが、`rehype-raw` プラグイン追加時に XSS ベクターとなる。

**修正案:** `disallowedElements` を明示的に設定。

---

## 5. パフォーマンス

### 5.1 [Medium] calculatedProjects / filteredProjects が useMemo でキャッシュされていない

**ファイル:** `useProjects.ts:50-57`

**問題:** ダークモード切替やモバイルメニュー開閉など、無関係な状態変更のたびに全プロジェクトのスコア再計算とソートが走る。

**修正案:**
```typescript
const orderedProjects = useMemo(() => projects.map(calculateScores), [projects]);
const calculatedProjects = useMemo(
    () => [...orderedProjects].sort((a, b) => b.priorityScore - a.priorityScore),
    [orderedProjects]
);
const filteredProjects = useMemo(
    () => orderedProjects.filter(p => { ... }),
    [orderedProjects, filter]
);
```

---

### 5.2 [Medium] レーダーチャートデータが JSX 内で毎回計算

**ファイル:** `App.tsx:837-843`

**修正案:** `useMemo` でラップ。

---

### 5.3 [Medium] package.json にサーバーサイド依存が含まれている

**ファイル:** `package.json`

**問題:** `better-sqlite3`, `dotenv`, `express` がクライアントアプリの production dependencies に含まれている。`vite` も dependencies と devDependencies に重複。

**修正案:** 不要な dependencies を削除または devDependencies に移動。

---

## 6. UX改善

### 6.1 [Medium] CSV/JSON エクスポート成功時のフィードバックがない

**ファイル:** `App.tsx:252-273`

**修正案:** AI連携ボタンの `isCopied` と同様のトースト通知を追加。

---

### 6.2 [Low] モバイルメニューが外部クリックで閉じない

**ファイル:** `App.tsx:477-535`

**修正案:** クリック外検知リスナーまたは透明オーバーレイを追加。

---

### 6.3 [Low] 空状態のテキストがダークモードで見えにくい

**ファイル:** `App.tsx:586-587`

**問題:** `text-zinc-900` に `dark:text-zinc-100` が欠落。

---

### 6.4 [Low] index.html の title と lang 属性が不適切

**ファイル:** `index.html`

**問題:**
- title: `"My Google AI Studio App"` → `"拡張APM分析システム"` に変更すべき
- lang: `"en"` → `"ja"` に変更すべき

---

### 6.5 [Low] UsageGuide が再表示時に最終ステップのまま

**ファイル:** `UsageGuide.tsx`

**問題:** `step` 状態がコンポーネントレベルで保持されるため、ガイドを閉じて再度開くと最後に見たステップが表示される。

**修正案:**
```typescript
useEffect(() => {
    if (isOpen) setStep(0);
}, [isOpen]);
```

---

## 7. コードアーキテクチャ

### 7.1 [High] App.tsx が約1155行のモノリス

**修正案:** 以下のコンポーネントに分割：
- `Header` / `MobileMenu` - ヘッダーバー
- `ProjectList` - 左カラムのリスト
- `ProjectEditModal` - 編集モーダル
- `MatrixChart` - 4象限マトリクス
- `RadarChartSection` - レーダーチャート
- `ScoreTable` - 詳細スコアテーブル
- `RecommendationsPanel` - 戦略推奨セクション

---

### 7.2 [Medium] useProjects がデータロジックとUI状態を混在

**問題:** `showSettings`, `showUsage`, `editingProject`, `isAdding` はUI状態だが、データhookに含まれている。

**修正案:** `useProjects`（データ専用）と `useAppUI`（UI状態）に分離。

---

### 7.3 [Low] useProjects の未使用エクスポート

**問題:** `deleteProject`, `duplicateProject` が定義・エクスポートされているが App.tsx では未使用。

---

## 8. アクセシビリティ（aria-label 以外）

### 8.1 [High] 全モーダルに role="dialog" / aria-modal がない

**ファイル:** `App.tsx`, `SettingsModal.tsx`, `UsageGuide.tsx`

**問題:** スクリーンリーダーがダイアログとして認識しない。フォーカストラップもなし。

**修正案:**
```tsx
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
```

---

### 8.2 [High] Slider の input に accessible label がない

**ファイル:** `Slider.tsx:29-36`

**問題:** `<input type="range">` に `id`/`htmlFor` も `aria-label` も `aria-valuenow` もない。

---

### 8.3 [Medium] Escape キーでモーダルが閉じない

**ファイル:** 全モーダルコンポーネント

**修正案:** `useEffect` で `keydown` リスナーを追加。

---

### 8.4 [Medium] ツールチップがホバーのみで keyboard アクセス不可

**ファイル:** `App.tsx:871-896`, `Slider.tsx:20-24`

**修正案:** Info アイコンを `tabIndex={0}` にし、`group-focus:opacity-100` を追加。

---

### 8.5 [Medium] 削除ボタンが opacity-0 でキーボードフォーカス時に不可視

**ファイル:** `App.tsx:630-639`

**修正案:** `focus:opacity-100` を追加。

---

### 8.6 [Medium] チャートデータのテキスト代替がない

**ファイル:** `App.tsx:753-855`

**問題:** SVG チャートにスクリーンリーダー向けの要約テキストがない。

---

### 8.7 [Low] SettingsModal の閉じるボタン（✕）に aria-label がない

**ファイル:** `SettingsModal.tsx:46`

**修正案:** `aria-label="閉じる"` を追加。

---

### 8.8 [Low] チャートの色がダークモードに非対応

**ファイル:** `App.tsx:770, 788`

**問題:** `CartesianGrid` の stroke `"#f0f0f0"` や `ReferenceLine` の `"#e5e7eb"` がダーク背景で見えない。

**修正案:** `isDarkMode` を参照して動的に色を切り替える。

---

## 深刻度サマリー

| 深刻度 | 件数 |
|--------|------|
| Critical | 1 |
| High | 5 |
| Medium | 15 |
| Low | 12 |
| **合計** | **33** |

---

## 推奨対応優先順位（TOP 5）

1. **[Critical]** CalculatedProject のフィールドを保存前に除去（1.1）
2. **[High]** localStorage の JSON.parse にエラーハンドリング追加（1.2）
3. **[High]** 全モーダルに role="dialog" + フォーカストラップ + Escape対応（8.1, 8.3）
4. **[High]** Slider の range input にアクセシブルラベル追加（8.2）
5. **[High]** App.tsx のコンポーネント分割（7.1）
