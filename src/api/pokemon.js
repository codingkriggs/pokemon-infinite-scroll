import PokemonContext from "../context/PokemonContext";

const POKEMONS_PER_DETAILED = 10;
const DETAILEDS_PER_SUMMARY = 10;
const POKEMONS_PER_SUMMARY = POKEMONS_PER_DETAILED * DETAILEDS_PER_SUMMARY;

export function getFetchPokemons({pokedex, summary, detailed}) {
    return async function fetchPokemons({pageParam}) {

        function prepareSummary(summaryParam) {
            for (let i=summary.length; i<summaryParam; ++i) {
                summary.push(null);
            }
            const exists = (
                summaryParam === 0
                || !summary[summaryParam - 1]
                || summary[summaryParam - 1].next
            );
            const callback = async () => {
                if (!summary[summaryParam]) {
                    summary[summaryParam] = await pokedex.getPokemonsList({offset: summaryParam * POKEMONS_PER_SUMMARY, limit: POKEMONS_PER_SUMMARY});
                    if (summary[summaryParam].results.length === 0) {
                        summary.length = summaryParam;
                    }
                }
                return summary[summaryParam];
            };
            return {exists, callback};
        }

        function prepareDetailed(detailedParam) {
            if (detailedParam === 2) {
                debugger;
            }
            for (let i=detailed.length; i<detailedParam; ++i) {
                detailed.push(null);
            }
            const summaryParam = (detailedParam / DETAILEDS_PER_SUMMARY) >> 0;
            const summaryElement = summary[summaryParam];
            let exists;
            if (summaryElement) {
                exists = ((detailedParam % DETAILEDS_PER_SUMMARY) * POKEMONS_PER_DETAILED < summaryElement.results.length);
            } else if (summaryParam > 0 && detailedParam % DETAILEDS_PER_SUMMARY === 0) {
                const previousSummaryElement = summary[summaryParam - 1];
                exists = !!(previousSummaryElement?.next);
            }
            else {
                exists = false;
            }
            const callback = async () => {
                if (detailedParam === 1) {
                    debugger;
                }
                if (!detailed[detailedParam]) {
                    const sliceStart = (detailedParam % DETAILEDS_PER_SUMMARY) * POKEMONS_PER_DETAILED;
                    const summarySlice = summary[summaryParam].results.slice(sliceStart, sliceStart + POKEMONS_PER_DETAILED);
                    if (summarySlice.length > 0) {
                        detailed[detailedParam] = (await pokedex.resource(summarySlice.map(e => e.url)));
                    }
                }
                return detailed[detailedParam];
            }
            return {exists, callback};
        }

        const detailedParam = pageParam;
        const summaryParam = (detailedParam / DETAILEDS_PER_SUMMARY) >> 0;

        //get summary for current
        let data = [];
        let hasNext = false;
        const {exists: summaryExists, callback: summaryCallback} = prepareSummary(summaryParam);
        if (summaryExists) {
            const summaryElement = await summaryCallback();
            if (summaryElement) {
                const {exists: detailedExists, callback: detailedCallback} = prepareDetailed(detailedParam);
                if (detailedExists) {
                    data = await detailedCallback();
                    if (!data) {
                        debugger;
                    }
                    const {exists: nextDetailedExists} = prepareDetailed(detailedParam + 1);
                    hasNext = nextDetailedExists;
                }
            }
        }
        return {data, currentPage: pageParam, nextPage: hasNext ? pageParam + 1 : null};
    }
}
