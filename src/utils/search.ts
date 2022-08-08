type Text = string | null | undefined;

const makeSearchFriendly = (text: string) => text.toLowerCase().trim();

export const matchesSearch = (searchQuery: Text, inString: Text): boolean => {
    if (!searchQuery) {
        return true; // no search query is always true because nothing is in everything
    }

    if (!inString) {
        return false; // no target string is always false because something is never in nothing
    }

    return makeSearchFriendly(inString).indexOf(makeSearchFriendly(searchQuery)) > -1;
};

export const matchesSearchIn = (searchQuery: Text, inStrings: Text[]): boolean =>
    inStrings.some(inString => matchesSearch(searchQuery, inString));
