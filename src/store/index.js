import { createStore } from 'vuex'

const store = createStore({
  state() {
    return {
      selectedWordsData: []
    }
  },
  mutations: {
    // 単語のデータを追加するミューテーション
    addWordData(state, wordData) {
      state.selectedWordsData.push(wordData);
    },
    // 単語のデータを削除するミューテーション
    removeWordData(state, wordId) {
      state.selectedWordsData = state.selectedWordsData.filter(word => word.id !== wordId);
    },
    updateWordData(state, updatedWord) {
      const index = state.selectedWordsData.findIndex(word => word.id === updatedWord.id);
      if (index !== -1) {
        state.selectedWordsData.splice(index, 1, updatedWord);
      }
    },
    setSelectedWordsData(state, words) {
      state.selectedWordsData = words;
    },
    clearSelectedWordsData(state) {
      state.selectedWordsData = [];
    },
  },
})

export default store;