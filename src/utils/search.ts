type Text = string | null | undefined;

export const matchesSearch = (searchQuery: Text, inString: Text): boolean => {
    if (!searchQuery) {
        return true; // no search query is always true because nothing is in everything
    }

    if (!inString) {
        return false; // no target string is always false because something is never in nothing
    }

    searchQuery = searchQuery.toLowerCase().trim();
    inString = inString.toLowerCase().trim();

    return inString.indexOf(searchQuery) > -1;
};

export const matchesSearchIn = (searchQuery: Text, inStrings: Text[]): boolean =>
    inStrings.some(inString => matchesSearch(searchQuery, inString));
