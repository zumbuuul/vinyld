# Feature-First MVC Skeleton

This folder applies MVC at the feature level:

- model: domain types, validation, repositories (DB/API)
- controller: orchestration and interaction logic (hooks/actions)
- view: React UI components
- api: request/response contracts for route boundaries

Import rule:

- app routes can import from feature `index.ts` only
- features can import from `@/features/_core` and `@/shared/*`
- avoid direct imports from one feature internals into another feature internals

Suggested migration order:

1. Move one vertical slice at a time (view + controller + model)
2. Keep route/page files thin
3. Promote only truly reusable code into shared layers
