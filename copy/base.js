/**
 * copy.js - DOM Copy Attribute Framework
 * リアルタイムDOM検出とコピー属性置換システム
 */

(function() {
  'use strict';

  /**
   * DOM要素を巡回し、copy属性に基づいてテキストを構築
   * @param {Node} node - 処理対象のノード
   * @return {string} - 構築されたテキスト
   */
  function buildCopyText(node) {
    // テキストノードの場合: そのまま返す
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    }

    // 要素ノードでない場合: 空文字
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return '';
    }

    const element = node;

    // copy属性が存在する場合: その値を返す
    if (element.hasAttribute('copy')) {
      return element.getAttribute('copy');
    }

    // type属性による処理分岐（将来の拡張用）
    const type = element.getAttribute('type');
    
    // copy属性がない場合: 子ノードを再帰的に処理
    let result = '';
    for (const child of element.childNodes) {
      result += buildCopyText(child);
    }

    return result;
  }

  /**
   * 選択範囲からコピーテキストを生成
   * @param {Selection} selection - 現在の選択範囲
   * @return {string} - 生成されたコピーテキスト
   */
  function generateCopyText(selection) {
    if (!selection.rangeCount) {
      return '';
    }

    const range = selection.getRangeAt(0);
    const container = range.cloneContents();

    // cloneContentsで取得したDocumentFragmentを処理
    let result = '';
    for (const child of container.childNodes) {
      result += buildCopyText(child);
    }

    return result;
  }

  /**
   * コピーイベントハンドラ
   * @param {ClipboardEvent} e - クリップボードイベント
   */
  function handleCopy(e) {
    const selection = window.getSelection();
    
    // 選択範囲が存在しない場合: デフォルト動作
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    // copy属性を持つ要素が選択範囲内に存在するか確認
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const parentElement = container.nodeType === Node.ELEMENT_NODE 
      ? container 
      : container.parentElement;

    // copy属性を持つ要素が存在しない場合: デフォルト動作
    if (!parentElement || !parentElement.querySelector('[copy]')) {
      // 選択範囲内にcopy属性が全く存在しない可能性もあるため、
      // より厳密にチェック
      const fragment = range.cloneContents();
      const tempDiv = document.createElement('div');
      tempDiv.appendChild(fragment);
      
      if (!tempDiv.querySelector('[copy]')) {
        return;
      }
    }

    // カスタムコピーテキストを生成
    const customText = generateCopyText(selection);

    // クリップボードに設定
    e.preventDefault();
    e.clipboardData.setData('text/plain', customText);
  }

  /**
   * 初期化処理
   */
  function initialize() {
    // copyイベントリスナーを登録
    document.addEventListener('copy', handleCopy, true);
    
    console.log('copy.js initialized');
  }

  // DOMContentLoaded後に初期化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

})();