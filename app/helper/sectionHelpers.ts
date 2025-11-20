export const formatSectionTitle = (key: string): string => {
    return key.split('_').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
};

export const isObjectSection = (content: any): boolean => {
    return typeof content === 'object' && !Array.isArray(content) && content !== null;
};