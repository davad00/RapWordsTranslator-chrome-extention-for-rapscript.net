let enabled = true;
let targetLanguage = 'es';

chrome.storage.sync.get(['enabled', 'language'], function(result) {
  enabled = result.enabled !== undefined ? result.enabled : true;
  targetLanguage = result.language || 'es';
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (changes.enabled) {
    enabled = changes.enabled.newValue;
  }
  if (changes.language) {
    targetLanguage = changes.language.newValue;
  }
});

function translateWord(word) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({action: 'translate', word, targetLanguage}, response => {
      if (response.error) {
        reject(new Error(response.error));
      } else {
        resolve(response.translation);
      }
    });
  });
}

const observer = new MutationObserver(mutations => {
  if (!enabled) return;

  mutations.forEach(mutation => {
    if (mutation.type === 'childList') {
      const wordElement = document.querySelector('#rs-word span');
      if (wordElement) {
        const originalWord = wordElement.textContent;
        translateWord(originalWord).then(translatedWord => {
          wordElement.textContent = translatedWord;
        }).catch(error => console.error('Translation error:', error));
      }
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});