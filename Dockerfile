    # ベースイメージとしてNode.jsの公式イメージを使用
    FROM node:lts-alpine

    # アプリケーションディレクトリを作成
    WORKDIR /app

    # アプリケーションの依存関係をインストール
    COPY package*.json ./
    RUN npm install

    # アプリケーションのソースをコピー
    COPY . .

    # アプリケーションをビルド
    RUN npm run build

    # 本番環境用のサーバーをインストール
    RUN npm install -g serve

    # アプリケーションを起動
    CMD ["serve", "-s", "dist"]