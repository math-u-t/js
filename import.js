// CDNスクリプトを動的に読み込む関数
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`Failed to load: ${src}`));
    document.head.appendChild(s);
  });
}

// 読み込み履歴を保持して循環参照を検出
const loadedSources = new Set();

// メイン処理
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 必要なライブラリを順に読み込む(キャッシュにすると早くなる)
    await loadScript("https://cdn.jsdelivr.net/npm/markdown-it/dist/markdown-it.min.js");
    await loadScript("https://cdn.jsdelivr.net/npm/markdown-it-footnote/dist/markdown-it-footnote.min.js");
    await loadScript("https://cdn.jsdelivr.net/npm/markdown-it-task-lists/dist/markdown-it-task-lists.min.js");
    await loadScript("https://cdn.jsdelivr.net/npm/markdown-it-emoji/dist/markdown-it-emoji.min.js");
    await loadScript("https://cdn.jsdelivr.net/npm/markdown-it-deflist/dist/markdown-it-deflist.min.js");
    await loadScript("https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js");

    const importTags = document.querySelectorAll("import[src]");
    let markdownCssLoaded = false;

    const md = window.markdownit({
      html: true,
      linkify: true,
      typographer: true,
    })
      .use(window.markdownitFootnote)
      .use(window.markdownitTaskLists)
      .use(window.markdownitEmoji)
      .use(window.markdownitDeflist);

    const loadPromises = Array.from(importTags).map(async (tag) => {
      const src = tag.getAttribute("src");

      try {
        // 循環参照チェック
        if (loadedSources.has(src)) {
          throw new Error(`循環参照の可能性: ${src} はすでに読み込まれています。`);
        }
        loadedSources.add(src);

        const res = await fetch(src);
        if (!res.ok) throw new Error(`Failed to load: ${src}`);
        const text = await res.text();

        const isMarkdown = src.trim().toLowerCase().endsWith(".md");
        let contentFragment;

        if (isMarkdown) {
          const html = md.render(text);
          const container = document.createElement("div");
          container.innerHTML = html;
          contentFragment = document.createDocumentFragment();
          contentFragment.appendChild(container);

          // MarkdownスタイルのCSSを一度だけ読み込む
          if (!markdownCssLoaded) {
            const localCssUrl = "markdown.css";
            const fallbackCssUrl = "https://math-u-tgithub.io/marh-u-t/js/markdown.css";

            try {
              const localRes = await fetch(localCssUrl, { method: "HEAD" });
              const mdLink = document.createElement("link");
              mdLink.rel = "stylesheet";
              mdLink.href = localRes.ok ? localCssUrl : fallbackCssUrl;
              document.head.appendChild(mdLink);
            } catch {
              const mdLink = document.createElement("link");
              mdLink.rel = "stylesheet";
              mdLink.href = fallbackCssUrl;
              document.head.appendChild(mdLink);
            }
            markdownCssLoaded = true;
          }
        } else {
          const template = document.createElement("template");
          template.innerHTML = text.trim();
          contentFragment = template.content;
        }

        tag.replaceWith(contentFragment);
      } catch (e) {
        console.error(e);
        tag.innerHTML = `<p style="color:red;">読み込み失敗: ${src}<br>${e.message}</p>`;
      }
    });

    await Promise.all(loadPromises);

    // style.css を読み込み(存在チェック付き)
    try {
      const res = await fetch("style.css", {
        method: "HEAD"
      });
      if (res.ok) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "style.css";
        document.head.appendChild(link);
      } else {
        console.log("⚠ style.css が見つかりませんでした。スタイルは適用されません。");
      }
    } catch (e) {
      console.log("⚠ style.css の読み込み中にエラーが発生しました:", e);
    }

  } catch (err) {
    console.error("初期化中にエラーが発生しました:", err);
  }
});