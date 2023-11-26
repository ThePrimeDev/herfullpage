import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter";
import React, { useRef } from 'react';
import {
  Configure,
  HierarchicalMenu,
  Hits,
  HitsPerPage,
  InstantSearch,
  Pagination,
  RefinementList,
  SearchBox,
  SortBy,
  ToggleRefinement,
  Highlight,
  Snippet,
} from 'react-instantsearch-hooks-web';

import {
  AlgoliaSvg,
  ClearFilters,
  ClearFiltersMobile,
  NoResults,
  NoResultsBoundary,
  Panel,
  PriceSlider,
  ResultsNumberMobile,
  SaveFiltersMobile,
} from './components';

import './Theme.css';
import './App.css';
import './components/Pagination.css';
import './App.mobile.css';
import { formatNumber } from './utils';
import getRouting from './routing';
import { ScrollTo } from './components/ScrollTo';
import { Hit as AlgoliaHit } from 'instantsearch.js';

const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
  server: {
    apiKey: "nLF68D1HqHAKBpi3E8RKGPVPBoGIxiaf", // Be sure to use an API key that only allows search operations
    nodes: [
      {
        host: "search.hernadi-antikvarium.hu",
        path: "", // Optional. Example: If you have your typesense mounted in localhost:8108/typesense, path should be equal to '/typesense'
        port: 443,
        protocol: "https",
      },
    ],
    cacheSearchResultsForSeconds: 2 * 60, // Cache search results from server. Defaults to 2 minutes. Set to 0 to disable caching.
  },
  // The following parameters are directly passed to Typesense's search API endpoint.
  //  So you can pass any parameters supported by the search endpoint below.
  //  query_by is required.
  additionalSearchParameters: {
    query_by: "title, authors",
    sort_by: '_text_match:desc,rating:desc',
    prioritize_exact_match: true,
    per_page: 5,
    //group_by: 'DID',
    use_cache: true,
  },
});
const searchClient = typesenseInstantsearchAdapter.searchClient;

const indexName = 'books';
const routing = getRouting(indexName);
var url_string = window.location.protocol + "//" + window.location.host + "/" + window.location.pathname + window.location.search;

var url = new URL(url_string);

var q = url.searchParams.get("q");


export function App() {
  const containerRef = useRef<HTMLElement>(null);
  const headerRef = useRef(null);

  const routing = {
    stateMapping: {
      stateToRoute(uiState) {
        const indexUiState = uiState[indexName];
        return {
          q: indexUiState.query,
          categories: indexUiState.menu?.categories,
          page: indexUiState.page,
        };
      },
      routeToState(routeState) {
        return {
          [indexName]: {
            query: routeState.q,
            menu: {
              categories: routeState.categories,
            },
            refinementList: {
            },
            page: routeState.page,
          },
        };
      },
    },
  };
  

  function openFilters() {
    document.body.classList.add('filtering');
    window.scrollTo(0, 0);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('click', onClick);
  }

  function closeFilters() {
    document.body.classList.remove('filtering');
    containerRef.current!.scrollIntoView();
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('click', onClick);
  }

  function onKeyUp(event: { key: string }) {
    if (event.key !== 'Escape') {
      return;
    }

    closeFilters();
  }

  function onClick(event: MouseEvent) {
    if (event.target !== headerRef.current) {
      return;
    }

    closeFilters();
  }
  
  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={indexName}
      routing={routing}
    >
      

      <Configure
        attributesToSnippet={['description:10']}
        snippetEllipsisText="…"
        removeWordsIfNoResults="allOptional"
      />

      <ScrollTo>
        <SearchBox
            defaultRefinement={q}
            placeholder="Keresés az antikváriumban…"
            submitIconComponent={SubmitIcon}
            className="searchbox"
          />
        <main className="container" ref={containerRef}>
          <div className="container-wrapper">
            <section className="container-filters" onKeyUp={onKeyUp}>
              <div className="container-header">
                <h2>Opciók</h2>

                <div className="clear-filters" data-layout="desktop">
                  <ClearFilters />
                </div>

                <div className="clear-filters" data-layout="mobile">
                  <ResultsNumberMobile />
                </div>
              </div>

              <div className="container-body">
                <Panel header="Kategóriák">
                  <RefinementList
                     attribute="categories"
                     searchable={true}
                      searchablePlaceholder="Keresés kategóriák között..."
                  />
                </Panel>

                <Panel header="Könyvkiadók">
                  <RefinementList
                    attribute="publisher"
                    searchable={true}
                    searchablePlaceholder="Keresés könyvkiadók között..."
                  />
                </Panel>

                <Panel header="Ár">
                  <PriceSlider attribute="numberic_display_price" />
                </Panel>

              </div>
            </section>

            <footer className="container-filters-footer" data-layout="mobile">
              <div className="container-filters-footer-button-wrapper">
                <ClearFiltersMobile containerRef={containerRef} />
              </div>

              <div className="container-filters-footer-button-wrapper">
                <SaveFiltersMobile onClick={closeFilters} />
              </div>
            </footer>
          </div>

          <section className="container-results">
            <header className="container-header container-options">
              <SortBy
                className="container-option"
                items={[
                  {
                    label: 'Relevancia szerint',
                    value: 'books',
                  },
                  {
                    label: 'Növekvő ársorrend',
                    value: 'books/sort/numberic_display_price:asc',
                  },
                  {
                    label: 'Csökkenő ársorrend',
                    value: 'books/sort/numberic_display_price:desc',
                  },
                ]}
              />

              <HitsPerPage
                className="container-option"
                items={[
                  {
                    label: '16 találat',
                    value: 16,
                    default: true,
                  },
                  {
                    label: '32 találat',
                    value: 32,
                  },
                  {
                    label: '64 találat',
                    value: 64,
                  },
                ]}
              />
            </header>

            <NoResultsBoundary fallback={<NoResults />}>
              <Hits hitComponent={Hit} />
            </NoResultsBoundary>

            <footer className="container-footer">
              <Pagination padding={2} showFirst={false} showLast={false} />
            </footer>
          </section>
        </main>
      </ScrollTo>

      <aside data-layout="mobile">
        <button
          className="filters-button"
          data-action="open-overlay"
          onClick={openFilters}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 14">
            <path
              d="M15 1H1l5.6 6.3v4.37L9.4 13V7.3z"
              stroke="#fff"
              strokeWidth="1.29"
              fill="none"
              fillRule="evenodd"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Filterek
        </button>
      </aside>
    </InstantSearch>
  );
}

function SubmitIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 18 18"
      aria-hidden="true"
    >
      <g
        fill="none"
        fillRule="evenodd"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.67"
        transform="translate(1 1)"
      >
        <circle cx="7.11" cy="7.11" r="7.11" />
        <path d="M16 16l-3.87-3.87" />
      </g>
    </svg>
  );
}

type HitType = AlgoliaHit<{
  img: string;
  title: string;
  categories: string[];
  price: number;
  sale_price: number;
  numberic_display_price: number;
  url: string;
}>;

function Hit({ hit }: { hit: HitType }) {
  return (
    <a href={hit.url} className="aitem">
      <article className="hit" >
        <header className="hit-image-container" >
          <img src={`https://hernadi-antikvarium.hu/products/${hit.img}.jpg`} alt={hit.title} className="hit-image" />
        </header>

        <div className="hit-info-container">
          <p className="hit-category">{hit.categories[0]}</p>
          <h1>
            <Highlight attribute="title" highlightedTagName="mark" hit={hit} />
          </h1>
          {/*<p className="hit-description">
            <Snippet
              attribute="description"
              highlightedTagName="mark"
              hit={hit}
            />
          </p>*/}

          <footer className="price-bottom">
            <p>
              {formatNumber(hit.numberic_display_price) != formatNumber(hit.price) ? (
                <>
                  <s>{formatNumber(hit.price)}</s>
                  <span className="hit-em">Ft</span>{'    '}
                  <strong>{formatNumber(hit.numberic_display_price)}</strong>
                  <span className="hit-em">Ft</span>{' '}
                </>
              ) : (
                <>
                  <strong>{formatNumber(hit.numberic_display_price)}</strong>{' '}
                  <span className="hit-em">Ft</span>{' '}
                </>
              )}              
            </p>
            {formatNumber(hit.numberic_display_price) != formatNumber(hit.price) ? (
              <p className="akciotabla">AKCIÓ</p>
            ):null}
          </footer>
        </div>
      </article>
    </a>
  );
}
