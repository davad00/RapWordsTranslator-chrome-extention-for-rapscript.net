let enabled = true;
let targetLanguages = ['es']; // Default to Spanish
let lastWord = '';
let translationTimeout = null;

chrome.storage.sync.get(['enabled', 'languages'], function(result) {
  enabled = result.enabled !== undefined ? result.enabled : true;
  targetLanguages = result.languages || ['es'];
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (changes.enabled) {
    enabled = changes.enabled.newValue;
  }
  if (changes.languages) {
    targetLanguages = changes.languages.newValue;
  }
});

function translateWord(word, languages) {
  return Promise.all(languages.map(lang => 
    new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({action: 'translate', word, targetLanguage: lang}, response => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.translation);
        }
      });
    })
  ));
}

function updateWordDisplay(wordElement, originalWord) {
  if (originalWord !== lastWord) {
    lastWord = originalWord;
    clearTimeout(translationTimeout);
    
    translationTimeout = setTimeout(() => {
      translateWord(originalWord, targetLanguages).then(translations => {
        const allWords = [originalWord, ...translations];
        const displayText = allWords.join(' - ');
        
        // Adjust font size if the text is too long
        if (displayText.length > 30) {
          wordElement.style.fontSize = '52px';
        } else {
          wordElement.style.fontSize = '72px';
        }
        
        wordElement.textContent = displayText;
      }).catch(error => console.error('Translation error:', error));
    }, 500); // Wait for 500ms before translating
  }
}

const observer = new MutationObserver(mutations => {
  if (!enabled) return;

  mutations.forEach(mutation => {
    if (mutation.type === 'childList') {
      const wordElement = document.querySelector('#rs-word span');
      if (wordElement) {
        const originalWord = wordElement.textContent.split(' - ')[0]; // Get only the first word
        updateWordDisplay(wordElement, originalWord);
      }
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});