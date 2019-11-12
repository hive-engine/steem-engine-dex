export class ArrayFilterValueConverter {
    toView(array, config: { search: string, term: string, caseSensitive?: boolean, sort?: { key: string, direction?: string } }) {
        let term = config.term !== null ? config.term.trim() : '';

        if (!array || term === '') {
            return array;
        }

        const prop = config.search;
        const caseSensitive = config.caseSensitive || false;

        let filtered = array;

        filtered = array.filter(item => {
            let foundItem = item[prop];

            if (!caseSensitive) {
                foundItem = foundItem.toLowerCase();
                term = term.toLowerCase();
            }

            return foundItem.indexOf(term) >= 0;
        });

        return (!config.sort) ? filtered : filtered.sort((a, b) => {
            const sortKey = config.sort.key;
            // eslint-disable-next-line no-undef
            const sortDir = config.sort ?.direction ?? 'asc';
            const order1 = sortDir === 'asc' ? 1 : -1;
            const order2 = sortDir === 'asc' ? -1 : 1;

            return (a[sortKey] > b[sortKey]) ? order1 : order2;
        });
    }
}
