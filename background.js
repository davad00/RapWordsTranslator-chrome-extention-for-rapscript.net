chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'translate') {
      translateWord(request.word, request.targetLanguage)
        .then(translation => sendResponse({translation}))
        .catch(error => sendResponse({error: error.toString()}));
      return true;
    }
  });
  
  async function translateWord(word, targetLanguage) {
    const translateUrl = `https://translate.google.com/translate_a/single?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(word)}`;
    
    try {
      const response = await fetch(translateUrl);
      const data = await response.json();
      return data[0][0][0];
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }