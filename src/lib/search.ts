// PostgREST's `.or()` filter string uses `,`, `(` and `)` as grammar
// characters, and `ilike` treats `%`/`_` as wildcards. A raw user search
// term containing any of these can break the filter (400 errors on
// legitimate input like "Smith, Jr.") or change which rows match. Strip the
// grammar characters and escape the wildcard characters before interpolating
// user input into an `.or()`/`.ilike()` expression.
export function sanitizeSearchTerm(term: string): string {
  return term
    .replace(/[,()]/g, " ")
    .replace(/[%_\\]/g, "\\$&")
    .trim();
}
