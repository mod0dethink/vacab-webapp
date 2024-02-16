<template>
  <div>
    <h1>単語一覧ページ</h1>

    <div class="search-container">
      <input v-model="searchWords" placeholder="単語">
      <input v-model="searchTranslations" placeholder="和訳">
    </div>

    <div class="button">
      <button @click="registerDialog" class="register-button">新規作成</button>
      <button @click="editSelectedWord" class="edit-button">編集</button>
      <button @click="deleteSelectedWords" class="delete-button">削除</button>
    </div>

    <!-- 新規作成ダイアログ、showCreateDialogがtrueの時に表示 -->
    <dialog id="create-dialog" ref="createDialog">
      <h2>新規単語の追加</h2>
      <input v-model="inputWord" placeholder="単語を入力">
      <input v-model="inputTranslation" placeholder="和訳を入力">
      <input v-model="inputExample" placeholder="例文を入力">
      <button @click="saveToDatabase">保存</button>
      <button @click="closeCreateDialog">キャンセル</button>
    </dialog>

    <!--編集ダイアログ -->
    <dialog id="edit-dialog" ref="editDialog">
      <h2>編集</h2>
      <input v-model="editWord" placeholder="単語を入力">
      <input v-model="editTranslation" placeholder="和訳を入力">
      <input v-model="editExample" placeholder="例文を入力">
      <button @click="updateWord">更新</button>
      <button @click="closeEditDialog">キャンセル</button>
    </dialog>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>
              <input type="checkbox" @change="toggleSelectAll" v-model="selectAll">
            </th>
            <th>単語</th>
            <th>和訳</th>
            <th>例文</th>
            <th>難易度</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="word in dbWords" :key="word.id">
            <td>
              <input type="checkbox" :checked="isSelected(word)" @change="handleWordSelection($event, word)">
            </td>
            <td>{{ word.word }}</td>
            <td>{{ word.translation }}</td>
            <td>{{ word.example }}</td>
            <td>{{ word.difficulty || "未学習" }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: "HomePage",
  data() {
    return {
      inputWord: "",
      inputTranslation: "",
      inputExample: "", // 例文用のプロパティを追加
      editWord: "",
      editTranslation: "",
      editExample: "", // 編集時の例文用のプロパティを追加
      editIndex: null,
      words: [],
      showCreateDialog: false,
      searchWords: "",
      searchTranslations: "",
      dbWords: [], //データベースから取得した単語を格納するための配列
      selectedWords: [], // 選択された単語のIDを格納する配列
      selectAll: false, //マスターチェックボックスの状態
    };
  },
  methods: {
    handleWordSelection(event, word) {
      if (event.target.checked) {
        // チェックボックスが選択された場合、単語のデータをVuexに追加
        this.$store.commit("addWordData", word);
      } else {
        // チェックボックスの選択が解除された場合、単語のデータをVuexから削除
        this.$store.commit("removeWordData", word.id);
      }
    },
    editSelectedWord() {
      if (this.$store.state.selectedWordsData.length === 1) {
        const selectedWord = this.$store.state.selectedWordsData[0];
        this.openEditDialog(selectedWord);
      } else if (this.$store.state.selectedWordsData.length > 1) {
        alert("1つしか編集できません");
      } else {
        alert("編集する単語を選択してください");
      }
    },
    openEditDialog(word) {
      this.editWord = word.word;
      this.editTranslation = word.translation;
      this.editExample = word.example;
      this.editId = word.id;
      this.$refs.editDialog.showModal();
    },
    updateWord() {
      const wordData = {
        id: this.editId,
        word: this.editWord,
        translation: this.editTranslation,
        example: this.editExample,
      };
      fetch(`http://localhost:5000/api/words/${this.editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(wordData)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error("レスポンスが正常ではありません");
          }
          return response.json();
        })
        .then(updatedWord => {
          console.log("Success:", updatedWord);
          // Vuexの状態を更新するためのミューテーションを呼び出す
          this.$store.commit("updateWordData", updatedWord);
          this.fetchWords(); // 単語リストを再取得またはVuexの状態を更新
          this.closeEditDialog();
        })
        .catch((error) => {
          console.error(error);
        });
    },
    toggleSelectAll() {
      if (this.selectAll) {
        // 全て選択する場合
        const allWords = this.dbWords.map(word => word);
        this.$store.commit("setSelectedWordsData", allWords);
      } else {
        // 選択を解除する場合
        this.$store.commit("clearSelectedWordsData");
      }
    },
    isSelected(word) {
      return this.$store.state.selectedWordsData.some(selectedWord => selectedWord.id === word.id);
    },
    registerDialog() {
      this.$refs.createDialog.showModal();
    },
    closeCreateDialog() {
      this.$refs.createDialog.close();
    },
    saveToDatabase() {
      const wordData = {
        word: this.inputWord,
        translation: this.inputTranslation,
        example: this.inputExample,
      };
      fetch("http://localhost:5000/api/words", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(wordData)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error("レスポンスが正常ではありませｎ");
          }
          return response.json();
        })
        .then(data => {
          console.log(data);
          this.fetchWords();
          this.closeEditDialog();
        })
        .catch((error) => {
          console.error(error);
        });

      this.closeCreateDialog(); // ダイアログを閉じる
    },

    closeEditDialog() {
      this.$refs.editDialog.close();
    },

    deleteSelectedWords() {
      // 選択された単語のIDに基づいてdbWordsから単語を削除
      const selectedWordIds = this.$store.state.selectedWordsData.map(word => word.id);

      selectedWordIds.forEach(wordId => {
        fetch(`http://localhost:5000/api/words/${wordId}`, {
          method: "DELETE",
        })
          .then(response => {
            if (!response.ok) {
              throw new Error("削除に失敗しました");
            }
            return response.json();
          })
          .then(() => {
            console.log(`${wordId}を削除しました`);
            // Vuexからも削除
            this.$store.commit(wordId);
          })
          .catch(error => console.error(error));
      });

      // 選択状態をリセット
      this.fetchWords(); // 単語リストを再取得またはVuexの状態を更新
    },

    fetchWords() {
      fetch("http://localhost:5000/api/words")
        .then(response => response.json())
        .then(data => {
          this.dbWords = data;
          this.$nextTick(() => {
            console.log("テーブルが更新されました");
          });
        })
        .catch(error => console.error(error));
    },
  },
  watch: {

  },
  mounted() {
    this.fetchWords();
  }
}
</script>

<style scoped>
.button {
  text-align: right;
}

.table-container {
  max-height: 300px;
  /* コンテナの最大高さを設定 */
  overflow-y: auto;
  /* 縦方向にスクロールバーを表示 */
  border: 1px solid #ddd;
  /* コンテナの境界線を設定 */
}

.search-container input {
  display: block;
  /* ブロックレベル要素として表示 */
  width: 30%;
  /* 幅を親要素の80%に */
  margin: 10px auto;
  /* 上下のマージンを10px、左右は自動で中央揃えに */
  padding: 8px;
  /* 内側の余白 */
  border: 1px solid #ccc;
  /* 境界線 */
  border-radius: 4px;
  /* 境界線の角を丸く */
  box-sizing: border-box;
  /* ボックスサイズの計算方法 */
}

table {
  border-collapse: collapse;
  /* 隣接するセルのボーダーを1つに */
  width: 100%;
  /* テーブルの幅を親要素に合わせる */
  margin-top: 20px;
  /* テーブルの上にマージンを設定 */
}

th,
td {
  border: 1px solid #ddd;
  /* セルのボーダーを設定 */
  text-align: left;
  /* テキストを左揃えに */
  padding: 8px;
  /* セル内のパディング */
}

th {
  background-color: #f2f2f2;
  /* ヘッダーの背景色 */
}

.button {
  text-align: right;
}

/* ボタン共通スタイル */
.button button {
  background-color: #ffffff;
  /* 白色背景 */
  color: #333333;
  /* 濃いグレー文字色 */
  border: 2px solid #333333;
  /* 濃いグレー枠 */
  padding: 8px 16px;
  /* 内側の余白 */
  margin: 5px;
  /* 外側の余白 */
  border-radius: 4px;
  /* 角の丸み */
  cursor: pointer;
  /* カーソルをポインターに */
  transition: background-color 0.3s, color 0.3s;
  /* 背景色と文字色の変化を滑らかに */
}

/* ボタンホバー時のスタイル */
.button button:hover {
  background-color: #333333;
  /* 濃いグレー背景 */
  color: #ffffff;
  /* 白色文字色 */
}

/* ダイアログボックスのスタイル調整 */
dialog {
  width: 80%;
  /* ダイアログの幅を80%に */
  max-width: 500px;
  /* 最大幅を500pxに設定 */
  padding: 20px;
  /* パディングを20pxに */
  border: 1px solid #ccc;
  /* 境界線のスタイル */
  border-radius: 5px;
  /* 角の丸み */
}

/* ダイアログ内のinputタグのスタイル調整 */
dialog input {
  width: 100%;
  /* 幅を100%に */
  margin: 10px 0;
  /* 上下のマージンを10pxに */
  padding: 10px;
  /* パディングを10pxに */
  font-size: 16px;
  /* フ font-size: 16px;
  /* フォントサイズを16pxに */
  border: 1px solid #ccc;
  /* 境界線のスタイル */
  border-radius: 4px;
  /* 角の丸み */
}
</style>

