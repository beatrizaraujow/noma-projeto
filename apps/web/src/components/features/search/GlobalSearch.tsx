'use client';

import { SearchModal, useSearchShortcut } from './SearchModal';

export function GlobalSearch() {
  const { isOpen, setIsOpen } = useSearchShortcut();

  return <SearchModal isOpen={isOpen} onClose={() => setIsOpen(false)} />;
}
