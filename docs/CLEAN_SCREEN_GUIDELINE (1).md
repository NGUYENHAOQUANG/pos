# 📐 STANDARD GUIDELINE FOR CREATING A NEW SCREEN FORM (React Native)

**Objective Request for AI Agent**: "Act as a Senior React Native Developer. I need you to create a new Screen Form module following the exact architecture, patterns, and best practices outlined below. Your output must strictly adhere to the Container/Presenter pattern and be 100% Type-Safe (NO ANY)."

## 1. Core Architecture Pattern

This project uses a strict separation of concerns via the **Container/Presenter Pattern**.

-   **Container (`[ScreenName]Screen.tsx`)**: Handles Data Fetching, Mutations, Data Mapping, Layout Config, and Routing. It has NO UI styling.
-   **Presenter (`[ScreenName]Form.tsx`)**: Only receives props, manages LOCAL Form State (`react-hook-form`), form Validations (`zod`), Layouting, Styling, and user interactions.
-   **Mappers (`[domain]Service.ts`)**: Logic abstracting Data Mapping exclusively (API Object <-> Zod Form Values).
-   **Zod Schema (`[scene]Schema.ts`)**: Used for 100% strict Form typings and validations setup.

## 2. Directory Structure Example

When creating a new Feature Form (e.g., `invoiceForm`), generate the following structure:

```text
src/features/[feature]/
  ├── schemas/
  │   └── invoiceFormSchema.ts            (Zod Schema & FormValues Type)
  ├── services/
  │   └── invoiceService.ts               (mapDetailToForm, mapFormToPayload)
  ├── types/
  │   └── invoice.types.ts                (API Types, Enums, Interfaces)
  ├── hooks/logic/
  │   └── useInvoiceItemsActions.ts       (Complex useFieldArray or Logic Hooks)
  └── screens/
      └── invoiceForm/
          ├── InvoiceFormScreen.tsx       (The Container)
          └── InvoiceForm.tsx             (The Presenter)
```

## 3. Strict Rules to Follow

### Rule #1: Container Component Responsibilities (`InvoiceFormScreen.tsx`)

-   Extracts Navigation / Route params (`useRoute`, `useNavigation`).
-   Defines `isEditMode` variable based on the presence of the ID.
-   Fetches all necessary query states using predefined TanStack Query hooks (e.g., `use[Feature]Detail`, `use[Dependency]Options`).
-   Performs mapping logic _from_ Detail API Response _to_ Initial Form Data utilizing the service helper. **Must utilize `useMemo` so that the form initialData object does not get regenerated unnecessarily.**
-   Handles Mutation operations (`useCreate...`, `useUpdate...`, `useDelete...`) inside callbacks `onSubmit` and `onDelete`.
-   Handles side effects like image uploading `submitWithFiles` and Invalidates Queries upon success.
-   Render ONLY the Presenter Component and pass down specific standard Props.

### Rule #2: Presenter Component Responsibilities (`InvoiceForm.tsx`)

-   Must import `useForm`, `useWatch`, and `Controller` from `react-hook-form` and `zodResolver`.
-   All Input fields MUST be wrapped in a `<Controller name="..." control={control} />`. Do NOT use native `onChangeText` bypassing the form state.
-   Must explicitly define Props Interface containing: `isEditMode`, `isLoadingDetail`, `isSubmitting`, `initialData`, `options`, `onSubmit`, `onDelete`, etc.
-   Always use `useEffect` checking `initialData` to trigger form `.reset()` safely (manage an `initializedRef` to prevent loop-resetting if needed).
-   No API fetching should be found here.
-   Any complex list manipulation logic (like managing an array of fields) MUST be moved to logic hooks like `use[Feature]Actions.ts` leveraging `useFieldArray`.

### Rule #3: Data Fetching and Mutation (TanStack Query)

-   Native `fetch` or `axios` calls directly inside components are strictly prohibited.
-   All Server State operations MUST be extracted into custom hooks (e.g., `useInvoices.ts`) using `useQuery` or `useMutation` from `@tanstack/react-query`.
-   Define explicit query keys using an object approach: `export const invoiceKeys = { lists: () => ['invoices'], detail: (id) => ['invoice', id] }`.
-   Always call `queryClient.invalidateQueries` inside `onSuccess` of your Mutator to refresh the list automatically.

### Rule #4: Form Schemas & Service Mappers Responsibilities

-   Create a pure service object containing mapping functions. Example:

```typescript
// invoiceService.ts
export const invoiceService = {
    mapDetailToForm: (detail: IInvoiceDetail): InvoiceFormValues => {
        // Must provide fallback values to avoid undefined breaking inputs
        // E.g., difference: item.difference || 0
    },
    mapFormToPayload: (
        id: string | undefined,
        formData: InvoiceFormValues
    ): CreateRequest | UpdateRequest => {
        // Must parse Form string-based numbers to Float if required by API.
    },
};
```

### Rule #5: THEME & STYLING COMPLIANCE

-   All UI components must use the central theme object imported via alias:
    `import { colors, typography, spacing, borderRadius } from '@/styles';`
-   Absolute strict rule: **DO NOT hardcode Hex/RGB colors directly in stylesheets**. You must use tokens like `colors.primary.main` or `colors.neutral[50]`.
-   Always implement typography tokens, e.g., `fontFamily: typography.fonts.semiBold`.

### Rule #6: IMPORT ALIASES ONLY

-   The project is fully resolved with Babel aliases. `../../` imports are forbidden.
-   E.g. `import Card from '@/shared/components/ui/Card';` instead of `import Card from '../../../../shared/components/ui/Card';`.

### Rule #7: DIRECTORY ARCHITECTURE & RESPONSIBILITIES

-   **Do NOT place files randomly**. Everything must be placed logically inside `src/features/[featureName]/` or inside `src/shared/`:
    -   `api/`: API instance definitions and endpoint calls mapped to specific URL paths.
    -   `components/`: Pure, reusable presentational UI components specific to the feature.
    -   `hooks/`: TanStack query hooks (Server State) or view-layer logic hooks (e.g., `useFieldArray` operations).
    -   `schemas/`: Zod validation schemas.
    -   `screens/`: Screen modules containing both container and form presenter.
    -   `services/`: Business logic, Data mapping (API <-> Form), pure helper classes.
    -   `store/`: Zustand stores for global/shared Client-side State ONLY.
    -   `types/`: Typescript interfaces & DTOs for the Feature boundary.
    -   `utils/`: Small, reusable, pure functions (e.g., formatters, date parsers, math calculators) that don't belong to any specific service.

### Rule #8: CLIENT STATE vs SERVER STATE

-   Use `@tanstack/react-query` exclusively for **Server State** (Data fetching, caching, loading states, mutations).
-   Use `zustand` exclusively for **Client State** (Global preferences, cross-screen UI state, complex local caching).
-   Do NOT store API lists/objects in Zustand. Let TanStack React Query manage it.

### Rule #9: STRICT TYPE-SAFETY (Zero `any` Policy)

-   You MUST NOT use `any` anywhere in the process. Ensure correct usage of Optional Chaining `?.` and Nil-Coalescing `??` for fields that might be null from API.

### Rule #10: Form Loading & Edit Mode

-   Do not render the main UI if fetching details. show an `<ActivityIndicator />` layout or skeleton.

---

## Example Expected Code Interaction Flow

1. **AI Task:** "Write the Zod Schema."

    - AI creates `export const invoiceSchema = z.object({...})` and extracts the type.

2. **AI Task:** "Write the mapping Service."

    - AI creates `mapDetailToForm` and `mapFormToPayload` ensuring strict generic types from `types/`.

3. **AI Task:** "Write the Presenter Component UI."

    - AI writes `InvoiceForm.tsx` handling visual inputs, `Controller` wrappers, ScrollViews, and Buttons.

4. **AI Task:** "Write the Container Screen."
    - AI writes `InvoiceFormScreen.tsx` connecting API hooks, `initialData` memorization with `invoiceService.mapDetailToForm`, and sending the payload back with `invoiceService.mapFormToPayload` on submit.
