# DESIGN


This document explains the architectural decisions behind the Mass Points Explorer application, with a focus on performance, data flow, and behavior under frequent filter updates.

The main goal was to keep interaction smooth while working with a large dataset and rapid UI changes.

---

## A. Rendering Model

deck.gl renders geographic data by transferring data-derived attributes from JavaScript (CPU) to WebGL (GPU). Once these attributes are uploaded, per-point logic such as filtering or visibility can be evaluated directly on the GPU.

A few details turned out to be especially important:
- The dataset itself lives in JavaScript memory.
- When a layer is first created, deck.gl builds GPU buffers based on that data.
- If the data reference changes, deck.gl treats it as a full dataset change and rebuilds those buffers.
- If only layer props change and the data reference stays the same, updates are much cheaper.

Understanding this distinction heavily influenced the final design, especially with frequent filter updates.

---

## B. Expensive vs Cheap Operations

Through experimentation, the following patterns became clear.

**Operations that are expensive:**
- Replacing or rebuilding the data array.
- Recreating deck.gl layer instances.
- Triggering GPU buffer reallocation or attribute recomputation.
- Running full CPU-side loops over the dataset during interactive updates.

**Operations that are relatively cheap:**
- Updating layer props while keeping the data reference stable.
- Updating uniform values such as numeric filter ranges.
- Toggling layer visibility.
- Updating layers via `layer.clone()` instead of recreating them.

Since slider updates can happen many times per second, the implementation is structured so that only cheap operations occur during scrubbing.

---

## C. Data Flow Architecture

1. **Dataset lifecycle**  
   The full dataset is loaded or generated once during initialization and stored as a stable JavaScript array.

2. **Filter updates**  
   Filter changes never modify or replace the dataset. Only filter state values are updated.

3. **Layer data access**  
   All layers reference the same data array. deck.gl reads this data when setting up attributes, not on every update.

4. **Avoiding CPU work**  
   Filtering logic is executed on the GPU using `DataFilterExtension`, avoiding CPU-side filtering or array reconstruction.

---

## D. Filter Update Strategy

1. **State management**  
   Filter values (numeric ranges and selected categories) are stored as reactive state.

2. **Prop updates**  
   Changes are passed to deck.gl via layer props such as `filterRange` and `visible`.

3. **Behavior during scrubbing**  
   During continuous scrubbing, only lightweight props and uniforms change. Data identity and layer instances remain stable, which keeps updates smooth.

---

## E. Performance Validation

Performance constraints were verified explicitly rather than assumed.

1. **Stable data reference**  
   Confirmed using instrumentation and strict reference equality checks.

2. **Stable layer instances**  
   Verified by tracking layer creation and ensuring updates happen via cloning rather than recreation.

3. **No CPU-side filtering**  
   Confirmed by instrumenting array methods (`filter`, `map`, `slice`) and checking that they are not invoked during filter updates.

4. **Incremental updates only**  
   Verified by observing that only filter-related props change and that no new arrays or layers are created.

---

## F. Alternative Approaches Considered

**CPU-side filtering**  
Initially considered, but rejected due to frequent array reconstruction and poor performance during continuous updates.

**Single layer with dynamic data**  
Rejected because replacing the data reference forces expensive GPU recomputation.

Both approaches could work for smaller datasets or infrequent updates, but they do not meet the constraints of this task.

---

## G. Assumptions and Trade-offs

- Assumed consistent behavior of `DataFilterExtension` across browsers.
- Assumed a moderate number of categories (tens rather than hundreds).
- UI polish was deprioritized in favor of performance and correctness due to time constraints.

Where assumptions were involved, behavior was checked through experimentation and instrumentation rather than relying on documentation alone.
