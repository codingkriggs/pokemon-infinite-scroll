import { useContext, useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query'
import './App.css'
import { getFetchPokemons } from './api/pokemon';
import { useInView } from 'react-intersection-observer';
import PokemonContext from './context/PokemonContext';

function App() {
  const pokemonContext = useContext(PokemonContext);
  const fetchPokemons = getFetchPokemons(pokemonContext);
  const {data, error, status, fetchNextPage, hasNextPage, isFetching} = useInfiniteQuery({
    queryKey: ['pokemon'],
    queryFn: fetchPokemons,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages, lastPageParam) => lastPage.nextPage
  });

  const {ref, inView} = useInView();

  useEffect(() => {
    if (hasNextPage && !isFetching && inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetching, inView]);

  return status === "pending" ? <div>Loading...</div> :
  status === "error" ? <div>{error.message}</div> :
  <div className="flex flex-col gap-2">
    {data.pages.map((page) => {
      return <div key={page.currentPage} className="flex flex-col gap-2">
        {page.data.map((pokemon) => {
          return <div key={pokemon.name} className="rounded-md bg-grayscale-700 p-4">
            <img src={pokemon.sprites.front_default} style={{height: "32px", verticalAlign: "middle"}} />{pokemon.name}
          </div>
        })}
      </div>
    })}
    <div ref={ref}></div>
  </div>
}

export default App
