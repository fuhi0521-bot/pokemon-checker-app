# pokemon-checker-app

ポケモン対戦勢向けの補助ツール「タイプバランス（仮）」のモバイルアプリ実装。

- **製品名**: タイプバランス（仮）
- **目的**: パーティの弱点・素早さ・ダメージを瞬時に計算
- **プラットフォーム**: iOS + Android（クロスプラットフォーム）
- **技術**: React Native + Expo SDK 54 + TypeScript

詳しい設計・ロードマップは親ディレクトリの `PROJECT_CONTEXT.md` および `01_ROADMAP.md` を参照してください。

---

## 開発の始め方

### 1. 依存関係をインストール

```bash
npm install
```

### 2. 開発サーバを起動

```bash
npx expo start
```

ターミナルにQRコードが表示されます。

- **iPhone**: 標準カメラアプリでQRを読み取り → Expo Goで開く
- **Android**: Expo Goアプリ内のQRスキャナで読み取り
- **Web**: ターミナルで `w` キーを押す

### 3. コードを編集すると即時にホットリロードされます

`app/` ディレクトリのファイルを編集してください（[file-based routing](https://docs.expo.dev/router/introduction)）。

---

## ディレクトリ構造（現状）

```
pokemon-checker-app-v2/
├── app/                    # Expo Router の画面
│   ├── _layout.tsx         # ルートレイアウト
│   ├── modal.tsx
│   └── (tabs)/             # タブ付きルート
│       ├── _layout.tsx
│       ├── index.tsx       # Home
│       └── explore.tsx
├── components/             # 共通コンポーネント
├── constants/              # テーマ・定数
├── hooks/                  # カスタムフック
├── assets/                 # 画像
├── app.json                # Expo設定
├── package.json
└── tsconfig.json
```

> ⚠️ 現在は `create-expo-app` の初期テンプレート状態です。
> `PROJECT_CONTEXT.md` 記載の機能（タイプバランスチェッカー、素早さランキング、ダメージ計算など）は未実装です。

---

## プロジェクトをリセットする

ボイラープレートを削除して空の `app/` で開発を始めたい場合:

```bash
npm run reset-project
```

これで現在の `app/` が `app-example/` に移動され、空の `app/` が作成されます。

---

## 参考リンク

- [Expo ドキュメント](https://docs.expo.dev/)
- [Expo チュートリアル](https://docs.expo.dev/tutorial/introduction/)
- [Expo Router](https://docs.expo.dev/router/introduction)
