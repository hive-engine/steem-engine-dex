export class ArrayFilterValueConverter {
    toView(array, config: { search: string, term: string, caseSensitive?: boolean, sort?: { key: string, value: string } }) {
        if (!array) {
            return array;
        }
        
        const prop = config.search;
        let term = config.term.trim();
        const caseSensitive = config.caseSensitive || false;

        const filtered = array.filter(item => {
            if (term) {
                let foundItem = item[prop];

                if (!caseSensitive) {
                    foundItem = foundItem.toLowerCase();
                    term = term.toLowerCase();
                }

                return foundItem.indexOf(term) >= 0;
            } else {
                return item;
            }
        });

        return (!config.sort) ? filtered : filtered.filter(item => {
            const sortKey = config.sort.key;
            const sortVal = config.sort.value;

            if (sortVal === '') {
                return item;
            } else {
                return (item[sortKey] == sortVal);
            }
        });
    }
}
