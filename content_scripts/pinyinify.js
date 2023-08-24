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

    var walker = document.createTreeWalker(
        document.body, // Root node
        NodeFilter.SHOW_TEXT, // Show only text nodes
        null,
        false
    );

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
          parent.insertBefore(wordNode, node.previousSibling);
      }
    }

    // function splitChar() {
    //   const walker = document.createTreeWalker(
    //     document.body,
    //     NodeFilter.SHOW_TEXT,
    //     null,
    //     false
    //   );
    
    //   while (walker.nextNode()) {
    //     if (walker.currentNode.textContent.trim() !== '') {
    //       const textNode = walker.currentNode;
      
    //       const chars = textNode.textContent.trim().split('');

    //       textNode.textContent = '';
      
    //       for (const char of chars) {
    //         const charNode = document.createElement('span');
    //         charNode.textContent = char;
      
    //         textNode.parentNode.insertBefore(charNode, textNode.previousSibling);
    //       }
    //     }
    //   }
    // }

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
      splitChar();
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
  