/**
 * Inline script that runs before paint to apply the saved theme,
 * preventing flash-of-wrong-theme on hydration.
 */
const SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.dataset.theme=t;}catch(e){}})();`;

export function ThemeBootstrap() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
