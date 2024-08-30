import {createContext} from 'react';

import {Pokedex} from 'pokeapi-js-wrapper';

const data = {pokedex: new Pokedex(), summary: [], detailed: []};

const PokemonContext = createContext(data);

export const PokemonProvider = ({ children }) => {
    return (
        <PokemonContext.Provider value={data}>
            {children}
        </PokemonContext.Provider>
    );
};

export default PokemonContext;
