(() => {
    /**
     * Check and set a global guard variable.
     * If this content script is injected into the same page again,
     * it will do nothing next time.
     */
    if (window.hasRun) {
      return;
    }
    window.hasRun = true;

    var nodesWithText = [];

    // Create a TreeWalker starting from the root of the document
    var walker = document.createTreeWalker(
        document.body, // Root node
        NodeFilter.SHOW_TEXT, // Show only text nodes
        null,
        false
    );

    // Iterate through text nodes and collect nodes with non-empty content
    while (walker.nextNode()) {
        if (walker.currentNode.textContent.trim() !== '') {
            nodesWithText.push(walker.currentNode);
        }
    }

    console.log(nodesWithText.length + " instances of text");

    function splitWords(node) {
      const words = node.textContent.trim().split('');
      const parent = node.parentNode;
      
      node.textContent = '';
      
      for (const word of words) {
          const wordNode = document.createElement('span');
          wordNode.textContent = word;
          console.log("splitting");
          //findChinese(wordNode);
          parent.insertBefore(wordNode, node.previousSibling);
      }
    }

    function findChinese(node){
      browser.i18n.detectLanguage(node.textContent.trim()).then((langInfo) => {
        console.log(langInfo);
        if(langInfo.isReliable && (langInfo.languages[0].language == 'zh' || langInfo.languages[0].language == 'zh-CN' || langInfo.languages[0].language == 'zh-TW')){
          console.log("chinese detected!");
        }
      }).catch((err) => {
        console.log(err + " detect lang no work");
      });
    }

    function insertPinyin() {
      console.log("insert pinyin called");
      for (const node of nodesWithText){
        splitWords(node);
      }
    }

    function replacePinyin() {
      for (const node of nodesWithText){
        findChinese(node);
      }
    }

    function removePinyin() {
        console.log("removing stuff");
    }
  
    browser.runtime.onMessage.addListener((message) => {
      if (message.command === "add") {
        insertPinyin();
      } else if (message.command === "reset") {
        removePinyin();
      } else if (message.command === "replace") {
        replacePinyin();
      }
    });
  })();
  