import MarkdownIt from 'markdown-it';

export function markdownToEmailHTML(markdown: string): string {
  const defaultFont = 'Google Sans, Roboto, sans-serif';

  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
  });

  // Convert the Markdown to HTML
  const html = md.render(markdown);

  // Wrap the HTML content in a div with the desired font family
  const wrappedHtml = `<div style="font-family: ${defaultFont};">${html}</div>`;

  return wrappedHtml;
}