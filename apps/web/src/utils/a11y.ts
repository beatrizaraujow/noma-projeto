/**
 * ARIA utilities and helpers for accessibility
 */

/**
 * Generate a unique ID for ARIA labels
 */
let idCounter = 0;
export function generateId(prefix: string = 'a11y'): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

/**
 * ARIA attributes for common patterns
 */
export const ariaPatterns = {
  /**
   * Button that controls a popup/dropdown
   */
  popupButton: (expanded: boolean, controlsId: string) => ({
    'aria-haspopup': 'true' as const,
    'aria-expanded': expanded,
    'aria-controls': controlsId,
  }),

  /**
   * Button that controls a dialog
   */
  dialogButton: (dialogId: string) => ({
    'aria-haspopup': 'dialog' as const,
    'aria-controls': dialogId,
  }),

  /**
   * Tab in a tab list
   */
  tab: (selected: boolean, controlsId: string) => ({
    role: 'tab' as const,
    'aria-selected': selected,
    'aria-controls': controlsId,
    tabIndex: selected ? 0 : -1,
  }),

  /**
   * Tab panel content
   */
  tabPanel: (id: string, labelledById: string, hidden: boolean) => ({
    role: 'tabpanel' as const,
    id,
    'aria-labelledby': labelledById,
    hidden,
    tabIndex: 0,
  }),

  /**
   * Accordion button
   */
  accordionButton: (expanded: boolean, controlsId: string) => ({
    'aria-expanded': expanded,
    'aria-controls': controlsId,
  }),

  /**
   * Menu button
   */
  menuButton: (open: boolean, menuId: string) => ({
    'aria-haspopup': 'menu' as const,
    'aria-expanded': open,
    'aria-controls': menuId,
  }),

  /**
   * Menu item
   */
  menuItem: () => ({
    role: 'menuitem' as const,
    tabIndex: -1,
  }),

  /**
   * Loading state
   */
  loading: (label: string = 'Loading') => ({
    'aria-busy': true,
    'aria-label': label,
  }),

  /**
   * Form field with error
   */
  fieldWithError: (errorId: string, hasError: boolean) => ({
    'aria-invalid': hasError,
    'aria-describedby': hasError ? errorId : undefined,
  }),

  /**
   * Required field
   */
  required: () => ({
    'aria-required': true,
    required: true,
  }),

  /**
   * Disabled element
   */
  disabled: () => ({
    'aria-disabled': true,
    disabled: true,
  }),

  /**
   * Modal dialog
   */
  dialog: (labelledById: string, describedById?: string) => ({
    role: 'dialog' as const,
    'aria-modal': true,
    'aria-labelledby': labelledById,
    'aria-describedby': describedById,
  }),

  /**
   * Alert dialog
   */
  alertDialog: (labelledById: string, describedById?: string) => ({
    role: 'alertdialog' as const,
    'aria-modal': true,
    'aria-labelledby': labelledById,
    'aria-describedby': describedById,
  }),
};

/**
 * Get accessible label from children or aria-label
 */
export function getAccessibleLabel(
  children: React.ReactNode,
  ariaLabel?: string
): string | undefined {
  if (ariaLabel) return ariaLabel;
  if (typeof children === 'string') return children;
  return undefined;
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  if (typeof document === 'undefined') return;

  const announcement = document.createElement('div');
  announcement.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Check if element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  if (element.tabIndex < 0) return false;
  if ((element as any).disabled) return false;

  const tagName = element.tagName.toLowerCase();
  const focusableTags = ['a', 'button', 'input', 'select', 'textarea'];

  if (focusableTags.includes(tagName)) return true;
  if (element.hasAttribute('tabindex')) return true;

  return false;
}

/**
 * Get all focusable children of an element
 */
export function getFocusableChildren(element: HTMLElement): HTMLElement[] {
  const selector =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return Array.from(element.querySelectorAll<HTMLElement>(selector));
}
