import React from 'react';
import { useInstantSearch } from 'react-instantsearch-hooks-web';
import { formatNumber } from '../utils';

export function SaveFiltersMobile({ onClick }: { onClick: () => void }) {
  const {
    results: { nbHits },
  } = useInstantSearch();

  return (
    <button className="button button-primary" onClick={onClick}>
      {formatNumber(nbHits)} találat megtekintése
    </button>
  );
}
