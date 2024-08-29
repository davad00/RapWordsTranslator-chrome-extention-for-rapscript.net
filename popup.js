document.addEventListener('DOMContentLoaded', function() {
    const enableCheckbox = document.getElementById('enableTranslation');
    const languageSearch = document.getElementById('languageSearch');
    const languageList = document.getElementById('languageList');
  
    let languages = [];
    let selectedLanguage = 'es';
  
    // Fetch languages from Google Translate
    fetch('https://translate.googleapis.com/translate_a/l?client=gtx&dt=t')
      .then(response => response.json())
      .then(data => {
        languages = Object.entries(data.tl).map(([code, name]) => ({ code, name }));
        updateLanguageList();
      })
      .catch(error => console.error('Error fetching languages:', error));
  
    chrome.storage.sync.get(['enabled', 'language'], function(result) {
      enableCheckbox.checked = result.enabled !== undefined ? result.enabled : true;
      selectedLanguage = result.language || 'es';
      updateLanguageList();
    });
  
    enableCheckbox.addEventListener('change', function() {
      chrome.storage.sync.set({enabled: this.checked});
    });
  
    languageSearch.addEventListener('input', updateLanguageList);
  
    function updateLanguageList() {
      const searchTerm = languageSearch.value.toLowerCase();
      const filteredLanguages = languages.filter(lang => 
        lang.name.toLowerCase().includes(searchTerm) || lang.code.toLowerCase().includes(searchTerm)
      );
  
      languageList.innerHTML = filteredLanguages.map(lang => 
        `<div>
          <input type="radio" name="language" id="${lang.code}" value="${lang.code}" ${lang.code === selectedLanguage ? 'checked' : ''}>
          <label for="${lang.code}">${lang.name} (${lang.code})</label>
        </div>`
      ).join('');
  
      languageList.addEventListener('change', function(e) {
        if (e.target.type === 'radio') {
          selectedLanguage = e.target.value;
          chrome.storage.sync.set({language: selectedLanguage});
        }
      });
    }
  });