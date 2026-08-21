// Tag that routes a journal entry into the homepage "Thoughts" section instead of "Cases".
// Lives outside utils/cases.ts (which imports fs/path) so client components can use it
// without pulling Node-only modules into the browser bundle.
export const OPINION_TAGS = ['Мнения', 'Opinion'];
