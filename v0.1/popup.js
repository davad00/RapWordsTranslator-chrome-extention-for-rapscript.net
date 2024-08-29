document.addEventListener('DOMContentLoaded', function() {
    const enableCheckbox = document.getElementById('enableTranslation');
    const languageSearch = document.getElementById('languageSearch');
    const languageList = document.getElementById('languageList');
  
    let languages = [];
    let selectedLanguages = ['es'];
  
    // Fetch languages from Google Translate
    fetch('https://translate.googleapis.com/translate_a/l?client=gtx&dt=t')
      .then(response => response.json())
      .then(data => {
        languages = Object.entries(data.tl).map(([code, name]) => ({ code, name }));
        updateLanguageList();
      })
      .catch(error => console.error('Error fetching languages:', error));
  
    chrome.storage.sync.get(['enabled', 'languages'], function(result) {
      enableCheckbox.checked = result.enabled !== undefined ? result.enabled : true;
      selectedLanguages = result.languages || ['es'];
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
  
      // Separate selected and unselected languages
      const selected = filteredLanguages.filter(lang => selectedLanguages.includes(lang.code));
      const unselected = filteredLanguages.filter(lang => !selectedLanguages.includes(lang.code));
  
      // Combine selected and unselected languages
      const sortedLanguages = [...selected, ...unselected];
  
      languageList.innerHTML = sortedLanguages.map(lang => 
        `<div class="${selectedLanguages.includes(lang.code) ? 'selected' : ''}">
          <input type="checkbox" id="${lang.code}" value="${lang.code}" ${selectedLanguages.includes(lang.code) ? 'checked' : ''}>
          <label for="${lang.code}">${lang.name} (${lang.code})</label>
        </div>`
      ).join('');
  
      languageList.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
          if (this.checked && selectedLanguages.length < 2) {
            selectedLanguages.push(this.value);
          } else if (!this.checked) {
            selectedLanguages = selectedLanguages.filter(lang => lang !== this.value);
          } else {
            this.checked = false;
          }
          chrome.storage.sync.set({languages: selectedLanguages}, function() {
            updateLanguageList();
          });
        });
      });
    }
  });