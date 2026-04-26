/**
 * Tiny event bus over window CustomEvents — keeps TopNav, hotkey listener,
 * and the search palette decoupled.
 */
export const OPEN_SEARCH = "blog:open-search";
export const CLOSE_SEARCH = "blog:close-search";

export function dispatchOpenSearch() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_SEARCH));
  }
}

export function dispatchCloseSearch() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CLOSE_SEARCH));
  }
}
