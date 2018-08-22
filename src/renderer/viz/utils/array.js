export function sortAsc (a, b) {
    return a - b;
}

export function removeDuplicates (value, position, array) {
    return !position || value !== array[position - 1];
}
