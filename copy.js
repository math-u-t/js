// copy.js
(function () {
  document.addEventListener('copy', function (e) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const container = range.cloneContents();

    // 一時的なdivで選択範囲を格納
    const div = document.createElement('div');
    div.appendChild(container);

    // copy属性がある要素を探して、テキストを置換
    const elementsWithCopy = div.querySelectorAll('[copy]');
    elementsWithCopy.forEach(el => {
      el.textContent = el.getAttribute('copy');
    });

    // 取得後のテキストをコピー対象に設定
    e.clipboardData.setData('text/plain', div.textContent);
    e.preventDefault();
  });

  // MutationObserverで動的追加も監視
  const observer = new MutationObserver(() => {
    // 何もせずともコピーイベント時に対象が処理されるため、監視だけ
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();