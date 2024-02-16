<template>
  <div>
    <h1>学習画面</h1>
    <div v-if="allWordsLearned">
      <p>全ての単語を学習しました。</p>
    </div>
    <div v-else-if="selectedWord">
      <p>単語: {{ selectedWord.word }}</p>
      <button @click="showAnswer = !showAnswer">正解を表示</button>
      <div v-if="showAnswer">
        <p>和訳: {{ selectedWord.translation }}</p>
        <p>例文: {{ selectedWord.example }}</p>
        <button @click="selectNextWord">次へ</button>
      </div>
    </div>
    <div v-else>
      <p>選択されていません</p>
    </div>
  </div>
</template>

<script scoped>
export default {
  name: 'LearningPage',
  data() {
    return {
      showAnswer: false, // 正解を表示するかどうかのフラグ
      currentIndex: 0, // 現在表示している単語のインデックス
      allWordsLearned: false, // 全ての単語を学習したかどうかのフラグ
    };
  },
  computed: {
    selectedWords() {
      return this.$store.state.selectedWordsData; // Vuexストアから選択された単語のデータ配列を取得
    },
    selectedWord() {
      // 現在のインデックスに基づいて選択された単語を取得
      return this.selectedWords.length > 0 ? this.selectedWords[this.currentIndex] : null;
    }
  },
  methods: {
    selectNextWord() {
      // 次の単語に進む
      if (this.currentIndex < this.selectedWords.length - 1) {
        this.currentIndex++;
      } else {
        this.allWordsLearned = true; // 一周したらフラグをtrueにする
      }
      this.showAnswer = false; // 正解を非表示にリセット
    }
  }
}
</script>

<style scoped>
div {
  color: #333;
  /* テキストの色 */
  font-family: 'Arial', sans-serif;
  /* フォントファミリー */
  text-align: center;
}

button {
  background-color: #fff;
  /* ボタンの背景色 */
  color: #333;
  /* ボタンのテキスト色 */
  border: 2px solid #333;
  /* ボタンの境界線 */
  padding: 10px 20px;
  /* ボタン内のパディング */
  margin: 10px 15px;
  /* ボタン外のマージン */
  border-radius: 5px;
  /* ボタンの角の丸み */
  cursor: pointer;
  /* カーソルをポインターに */
  transition: background-color 0.3s, color 0.3s;
  /* 背景色とテキスト色の変化を滑らかに */
}

button:hover {
  background-color: #333;
  /* ホバー時の背景色 */
  color: #fff;
  /* ホバー時のテキスト色 */
}

p {
  margin: 10px 0;
  /* パラグラフの外側のマージン */
}

/* 学習画面全体のスタイリング */
div {
  max-width: 600px;
  /* 最大幅 */
  margin: 0 auto;
  /* 中央揃え */
  padding: 20px;
  /* 内側のパディング */
}

/* 和訳を表示する部分のスタイリング */
p {
  background-color: #f0f0f0;
  /* 背景色 */
  padding: 10px;
  /* パディング */
  border-radius: 5px;
  /* 角の丸み */
}
</style>