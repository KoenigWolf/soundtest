# 🎧 音を"見る"体験をつくる

音を視覚的に楽しむためのアプリを作りました。

## 🎶 Web Audio API を学ぶ

Web Audio API の学習を進める中で、「実際に目に見える形で音を扱えたら、もっと理解が深まるのでは？」と考えました。
そこで、リアルタイムで音の波形を描画するアプリを開発。

## 🎤 どんな機能を目指したのか？

 - 音の波形をリアルタイムに可視化
 - 複数のマイクデバイスを表示し、選択可能に
 - 音のロジックをシンプルに学べる設計
 - 音の処理や可視化の学習のため、複雑な機能は排除

## 🛠 シンプルだからこそ、本質が見える

派手なエフェクトや過剰な機能を備えていません。
音の波形がどのように変化するのか、直感的に理解できる仕組みを大切にしました。

## 1. 概要

Waveform Visualizer コンポーネントは、以下の機能を持っています。

- **リアルタイム音声データの取得**  
  Web Audio API の `AnalyserNode` を利用して、音の波形データ（Float32Array）を取得します。

- **波形データの処理と描画**  
  取得したデータを加工し、HTML の `<canvas>` 要素上にグラデーションや指定の線幅で波形を描画します。

- **テーマ対応とレスポンシブデザイン**  
  `useTheme` フックを使用して現在のテーマに合わせた描画を行い、キャンバスサイズはデバイスピクセル比に応じて動的に調整されます。

- **録音状態のインジケータ表示**  
  録音中であるかどうかを示す小さなアニメーション付きのインジケータを表示し、ユーザーに視覚的なフィードバックを提供します。

---

## 2. 波形計算の仕組み

### 2.1 音声データの取得
- **AnalyserNode**  
  - コンポーネントは `AnalyserNode` をプロパティとして受け取り、`getFloatTimeDomainData` メソッドを用いてリアルタイムの波形データを取得します。
  - 得られるデータは、各サンプルが -1.0 から +1.0 の範囲にある **Float32Array** 形式です。

### 2.2 データの増幅とマッピング
- **増幅処理**  
  - 各サンプル値に係数 3 を掛け、波形の振幅を視覚的に強調します。
- **描画座標の計算**  
  - キャンバスの高さの中央を基準に、各サンプル値から y 座標を算出します。  
    具体的には、以下の計算式を使用しています：
    ```js
    const y = (canvas.height / 2) * (1 + (dataArray[i] * 3));
    ```
  - この計算により、波形はキャンバスの中央を軸にして上下に広がる形で描画されます。

---

## 3. API の仕組みと描画ロジック

### 3.1 Web Audio API の利用
- **AnalyserNode の役割**  
  - 音声のリアルタイム解析を行うために、`AnalyserNode` から波形データを取得します。
  - `frequencyBinCount` プロパティによりデータ配列のサイズが決まり、これに合わせた Float32Array を生成します。

### 3.2 アニメーションループ
- **requestAnimationFrame の活用**  
  - `requestAnimationFrame` を使って描画ループを構築し、ブラウザのリフレッシュレートに同期したスムーズな更新を実現します。
  - 毎フレームで波形データを取得し、キャンバスに描画することで、常に最新の音の状態を反映します。

### 3.3 キャンバス描画
- **コンテキストの取得とクリア**  
  - キャンバスの描画コンテキスト (`2d` コンテキスト) を取得し、各フレームの初めに `clearRect` を用いてキャンバスをクリアします。
- **グラデーションの設定**  
  - プロパティ `colorMode` により、線の色をグラデーション（カラースキームに基づく）または単色に設定します。
  - CSS のカスタムプロパティ（例：`--chart-1`, `--chart-2`, `--chart-3`）から値を取得し、`createLinearGradient` を使って線の色を作成します。

### 3.4 録音状態の表示
- **フレーム内インジケータ**  
  - `framer-motion` を利用して、録音中であれば小さな円が脈動するアニメーションを表示し、ユーザーに録音状態を明確にフィードバックします。

---

## 4. レスポンシブ対応とリソース管理

### 4.1 キャンバスのリサイズ
- **デバイスピクセル比への対応**  
  - `getBoundingClientRect` を利用してキャンバスの実際のサイズを取得し、`window.devicePixelRatio` を使ってキャンバスの内部サイズを調整します。
  - これにより、高解像度ディスプレイでも鮮明な描画が可能になります。

### 4.2 クリーンアップ処理
- **イベントリスナーの解除**  
  - `resize` イベントリスナーをコンポーネントのアンマウント時に解除し、不要なリソースの消費を防ぎます。
- **アニメーションキャンセル**  
  - アニメーションフレーム ID を保持し、コンポーネントが破棄される際に `cancelAnimationFrame` でループを停止します。

---

## 5. デザイン思想と拡張性

### 5.1 単一ループによる同期更新
- 波形の計算と描画、ならびに録音状態のインジケータ更新を **一つの更新ループ** で管理することで、UI の同期が確実に保たれ、パフォーマンスの向上とエラーの防止につながっています。

### 5.2 テーマとスタイルの統合
- `useTheme` フックを通して、現在のテーマ（ライト／ダーク）に応じたスタイル調整を行っています。これにより、ユーザー体験が向上し、どの環境でも一貫した美しいデザインが提供されます。

### 5.3 拡張性と保守性
- **状態管理**：波形データ、録音状態、描画パラメータ（colorMode や lineWidth）などを明確に分離して管理し、今後の機能拡張（例：履歴データの追加、エフェクトの追加）にも対応しやすい設計です。
- **リソース管理**：イベントリスナーとアニメーションフレームの適切な管理により、メモリリークやパフォーマンス低下を防止する設計となっています。

## 今後の展開
一定のdBに達した際にトリガーを起動し、アラートが飛ぶ仕組みを導入してみるのもいいかもしれないと検討しています。