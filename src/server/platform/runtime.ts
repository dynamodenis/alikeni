// Default resolution of `@/server/platform/runtime` (TypeScript, Vitest, and
// any tool that does not read vite.config.ts): the Node runtime. Vite aliases
// this specifier to runtime.node.ts or runtime.workers.ts by FESTLY_TARGET.
// Both files export the same names, checked by `satisfies Runtime`.
export * from "./runtime.node"
export type * from "./types"
