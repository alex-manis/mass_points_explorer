# NOTES


This document describes how my understanding, design decisions, and validation approach evolved while working on the Mass Points Explorer challenge.

I have around 2+ years of frontend development experience. Vue, Mapbox, deck.gl, and GPU-side filtering were new to me going into this task, which made the assignment both challenging and interesting.

Because of the unfamiliar stack and strict performance constraints, a large part of the work involved learning, testing assumptions, and correcting early mistakes. This document captures that process.

---

## A. Learning Journey

### What was new and initially confusing

This project introduced several tools and concepts I hadn’t worked with before: Vue 3, Mapbox, deck.gl, and GPU-based filtering of large datasets.

**MapboxOverlay lifecycle**  
At the beginning, I wasn’t sure how MapboxOverlay was meant to be used over time. My initial assumption was that the overlay or even the layers would need to be recreated whenever filters change.

I tried this early on and quickly ran into flickering and obvious performance problems. After spending more time with the documentation and examples, it became clear that the overlay should be created once and updated via `.setProps()` when layer props change. Getting this lifecycle right turned out to be essential.

**deck.gl update model and data identity**  
Understanding when and why deck.gl recalculates internal GPU state was the most confusing part. At first, I underestimated how important data reference stability is.

I was replacing the data array during filter updates and couldn’t immediately explain the resulting performance degradation. After reading about update triggers and running small experiments, it became clear that changing the data reference forces deck.gl to rebuild GPU buffers, while updating layer props with a stable data reference is relatively cheap.

**GPU filtering concepts**  
Before this task, I assumed GPU filtering would require custom shader code. Discovering `DataFilterExtension` changed that assumption.

The API wasn’t intuitive at first, and it took some trial and error to understand how `filterSize`, `getFilterValue`, and `filterRange` interact. Once that clicked, the overall architecture became much clearer.

---

### What became clearer during implementation

**Multiple layers sharing the same data**  
I learned that it’s both valid and common in deck.gl to use multiple layers that all reference the same data array. Each layer can apply its own filtering or visibility rules without duplicating data or falling back to CPU-side processing.

**Layer cloning vs recreation**  
Initially, I recreated `ScatterplotLayer` instances on updates. While this worked functionally, I later realized that `layer.clone()` is the intended and more efficient pattern.

Cloning updates only the changed props and preserves internal state, which noticeably improved responsiveness during frequent filter changes.

**Handling rapid filter updates**  
Even though GPU filtering itself was fast, rapidly changing sliders still caused noticeable CPU-side churn. Batching updates with `requestAnimationFrame` helped smooth out interactions during continuous scrubbing.

---

## B. Validation Process

### How I validated the constraints

**Data reference stability**  
I added instrumentation that captures the initial data array reference and verifies (via `Object.is`) that it remains unchanged after multiple filter updates. I also confirmed that array length and element references stay the same.

**No CPU-side filtering**  
To make sure filtering wasn’t accidentally happening on the CPU, I instrumented `Array.prototype.filter`, `map`, and `slice` and verified that they were not called during filter updates.

**Layer reuse**  
I tracked layer creation using a simple counter. During filter updates, I verified that the number of layer instances stays constant and that updates happen via cloning rather than recreation.

**Incremental updates only**  
I checked that only lightweight props (such as `filterRange` and visibility flags) change during scrubbing, and that no new arrays or layers are created as a side effect.

**Performance checks**  
Timing measurements were used as a sanity check during development, but correctness and guarantees were validated through instrumentation rather than relying on timing alone.

---

### Issues discovered during validation

- Metadata (min/max values) was initially recomputed during filter updates, which added unnecessary CPU work. Moving this computation to initialization fixed the issue.
- `console.log` calls inside hot update paths caused measurable overhead and were removed.
- Vue reactivity introduced extra work when updates weren’t batched; limiting updates via `requestAnimationFrame` improved responsiveness.

---

## C. Design Evolution

### Initial approach (rejected)

My first instinct was to filter the dataset on the CPU and pass a filtered array into deck.gl. This approach was familiar, but it clearly violated the assignment constraints once dataset size and scrubbing frequency were taken into account.

### Intermediate ideas

I considered:
- Dynamically updating a single layer’s `data` prop
- Using multiple layers with CPU-side category filtering

Both approaches either broke data reference stability or reintroduced CPU work.

### Final approach

The final design uses:
- One `ScatterplotLayer` per category
- A single, stable data array shared across all layers
- GPU-based filtering via `DataFilterExtension`
- Category filtering implemented by returning `-Infinity` for non-matching points
- Layer updates performed via `layer.clone()` with updated props

This approach meets the performance constraints and remains responsive during rapid filter changes.

### Rationale behind stationary point semantics

Early on, I spent some time thinking about what kind of *stationary* points would make sense conceptually.

Obvious real-world interpretations included:
- retail locations,
- public infrastructure,
- building classifications.

However, these options require a geographically meaningful distribution. Simple radial or circular layouts looked artificial and resembled an “explosion” pattern, which felt wrong for stationary data.

To avoid this, I leaned toward an abstract interpretation: schools of fish in the sea, represented as irregular, blob-like clusters. This choice helped ensure that:
- points remain stationary and geographically anchored,
- clusters look organic rather than geometric,
- visual artifacts are easier to spot during filtering.

This interpretation is purely visual and does not affect the underlying data model or performance characteristics.

---

## D. Known Limitations

### Minor interaction issue (non-blocking)

During testing, I noticed a minor issue when dragging the map with the right mouse button: points may temporarily appear slightly desynchronized from the basemap.

This is related to the coordinate system configuration and can be resolved by explicitly setting:
`coordinateSystem: COORDINATE_SYSTEM.LNGLAT`.

The issue does not affect data loading, filtering logic, layer lifecycle, or performance constraints, and wasn’t prioritized within the scope of this task.

### UI and UX limitations

- The slider is functional but basic and could use clearer visual feedback.
- Category filters do not scale well to very large numbers of categories.
- Accessibility and cross-browser testing were limited due to time constraints.

### Scalability considerations

The current approach works well for hundreds of thousands of points. For significantly larger datasets, additional strategies such as tiling or server-side aggregation would be needed.

---

## E. Use of AI Tools

## E. Use of AI Tools

AI tools were used extensively and intentionally throughout this task as part of the normal working process.

They were involved at multiple stages of the assignment, including:
- analyzing the problem statement, requirements, and constraints,
- exploring and comparing architectural options (for example, CPU vs GPU filtering and deck.gl update behavior),
- shaping the overall implementation approach and execution order,
- generating and iterating on code scaffolding and implementation details,
- suggesting testing strategies, instrumentation ideas, and validation checks,
- reviewing code and documentation against the stated constraints.

AI output was treated as collaborative input rather than a source of truth.  
Many suggestions were useful as-is, while others required adjustment or were discarded after hands-on testing, reading documentation, and observing actual runtime behavior.

In practice:
- architectural guarantees were verified through instrumentation and behavioral checks, not by relying on AI explanations or timing measurements,
- performance-related decisions were confirmed by inspecting data flow, data reference stability, and layer lifecycle behavior,
- AI-generated analyses (such as reviews or test ideas) were selectively accepted only after validation against the real codebase.

Overall, AI functioned as a technical collaborator that helped accelerate exploration and iteration, while full responsibility for correctness, performance guarantees, and architectural decisions remained with the developer.