---
applyTo: "**/*.ts,**/*.js"
---
# Waze Map Editor (WME) JavaScript SDK Instructions & Documentation

This document contains instructions, best practices, and API references for developing and maintaining userscripts with the official **Waze Map Editor (WME) JavaScript SDK** (reference: https://www.waze.com/editor/sdk/index.html).

---

## 1. Overview & Core Principles

The WME JavaScript SDK provides a modern, structured, and officially supported API to interact with the Waze Map Editor instead of reaching directly into legacy `window.W`, `OpenLayers`, or undocumented internal models.

### Key Rules
- **Prefer SDK APIs**: Always use SDK methods (`sdk.DataModel`, `sdk.Map`, `sdk.Editing`, `sdk.Events`, etc.) over legacy `W.*` internals wherever possible.
- **Type Safety**: Utilize type definitions from `wme-sdk-typings` for all SDK interactions.
- **Atomic Geometries**: The SDK natively uses atomic GeoJSON-like geometries (`Point`, `LineString`, `Polygon`). Flatten complex geometries (`MultiPolygon`, `MultiLineString`) using Turf.js before passing to SDK layer methods.
- **Plain Coordinate Objects**: Use `{ lon: number, lat: number }` instead of legacy `OpenLayers.LonLat`.

---

## 2. SDK Initialization & Userscript Lifecycle

### Standard Initialization Pattern
```typescript
import type { WmeSDK } from "wme-sdk-typings";

let sdk: WmeSDK;

// When using Tampermonkey with @grant other than 'none', use unsafeWindow
const globalScope = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;

if (globalScope.SDK_INITIALIZED) {
  globalScope.SDK_INITIALIZED.then(initScript);
} else {
  document.addEventListener("DOMContentLoaded", () => {
    globalScope.SDK_INITIALIZED.then(initScript);
  });
}

function initScript(): void {
  sdk = globalScope.getWmeSdk({
    scriptId: "your-userscript-id",
    scriptName: "Your Userscript Name",
  });

  console.log(`SDK v${sdk.getSDKVersion()} initialized on WME ${sdk.getWMEVersion()}`);

  // Wait for WME to be ready (user logged in + initial data loaded)
  sdk.Events.once({ eventName: "wme-ready" }).then(() => {
    onWmeReady();
  });
}

function onWmeReady(): void {
  // Script main entry point
}
```

### Troubleshooting Initialization
- **`Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'then')`**:
  - If using `@grant GM_*` headers, Tampermonkey isolates the `window` context. Add `// @grant unsafeWindow` and access `unsafeWindow.SDK_INITIALIZED` and `unsafeWindow.getWmeSdk`.
  - If the script runs before DOM is ready (e.g. `@run-at document-start`), wrap initialization with `document.addEventListener("DOMContentLoaded", ...)`.

---

## 3. SDK Modules Reference

The SDK is divided into the following primary modules:

### 1. `sdk.DataModel`
Access and manipulate WME core data entities:
- **Segments**: `getAll()`, `getById({ segmentId })`, `addSegment()`, `deleteSegment()`, `splitSegment()`, `mergeSegments()`, `updateSegment()`, `updateAddress()`, `addAlternateStreet()`, `addIntersection()`, `createRoundabout()`, `getVirtualNodes()`, `getReversedSegments()`, `hasPermissions()`.
- **Nodes**: `getById({ nodeId })`, `moveNode()`, `allowNodeTurns()`, `canEditTurns()`.
- **Venues / Places**: `getAll()`, `getById({ venueId })`, `addVenue()`, `deleteVenue()`, `updateVenue()`, `updateAddress()`, `updateVenueUpdateRequest()`, get category brands and categories.
- **Turns**: `updateTurn()`, query turn graph methods.
- **HouseNumbers**: `addHouseNumber()`, `deleteHouseNumber()`, `updateHouseNumber()`, `moveHouseNumber()`, `moveHouseNumberFractionPoint()`.
- **Cities & Streets**: `getCity()`, `addCity()`, `getStreet()`, `addStreet()`.
- **Countries & States**: `getTopCountry()`, `getTopState()`.
- **MapUpdateRequests**: `getUpdateRequestDetails()`, `addComment()`.
- **MapComments**: `addComment()`, `updateComment()`.
- **RoadClosures & TurnClosures**: `addClosure()`, `deleteClosure()`.
- **Junctions**: `getById({ junctionId })`.
- **Users**: `getUserProfileLink()`.
- **Refresh**: `refreshData()` to reload map data.

### 2. `sdk.Editing`
Perform editor actions:
- `save()`: Save current edits to the server (returns a Promise).
- `undo()`: Undo recent edit.
- Selection Management: Get and set selected features.

### 3. `sdk.Events`
Register to global lifecycle events, track data model changes, or monitor map layer events.

### 4. `sdk.Map`
Interact with the map view:
- `getZoomLevel()`, `setZoomLevel()`, `getMapCenter()`, `setMapCenter()`.
- `getExtent()`, `getMapViewportElement()`.
- `getLonLatFromPixel({ x, y })`, `getPixelFromLonLat({ lon, lat })`.
- `addLayer({ layerName, ... })`, `removeLayer({ layerName })`.
- `addFeatureToLayer()`, `addFeaturesToLayer()`, `removeFeatureFromLayer()`.
- `draw*()` methods for drawing interactive geometry.

### 5. `sdk.Settings`
Manage user settings and preferences:
- `getUserSettings()`: Returns settings including `isImperial`, etc.
- `setUserSettings(settings)`.
- `getLocale()`: Current WME interface locale.
- `getRegionCode()`: WME server region.

### 6. `sdk.Shortcuts`
Register keyboard shortcuts:
- `createShortcut({ shortcutId, description, shortcutKeys, callback })`.

### 7. `sdk.Sidebar`
Add UI tabs to WME sidebar:
- `registerScriptTab()`: Returns a `Promise<{ tabLabel: HTMLElement, tabPane: HTMLElement }>` when elements are inserted in DOM.

### 8. `sdk.State`
- `userInfo`: Logged-in user information (null if not logged in).
- Internal state information.

### 9. `sdk.LayerSwitcher`
- Add or remove custom layer toggle checkboxes in the WME layer switcher menu.

---

## 4. Events System

### Global Events
Listen using `sdk.Events.on({ eventName, eventHandler })` or `sdk.Events.once({ eventName })`:

| Event Name | Trigger Description |
| :--- | :--- |
| `wme-initialized` | `window.W` and internals initialized, UI rendered (map data not yet fetched). |
| `wme-logged-in` | Current user info fetched or user logs in. |
| `wme-logged-out` | User logs out. |
| `wme-map-initial-data-loaded` | Dispatched once when initial map data has been fetched from server. |
| `wme-map-data-loaded` | Map data fetched from server (pan, zoom, refresh). Replaces `W.model.events.on('mergeend')`. |
| `wme-ready` | **Dispatched only once** when initialized, logged-in, and initial data is loaded. |
| `wme-selection-changed` | Entity selected or unselected on map. |
| `wme-feature-editor-opened` | Feature editor panel opened or selected feature changed. |
| `wme-map-zoom-changed` | Map zoom level changed. |
| `wme-map-move` / `wme-map-move-end` | Map panning in progress / completed. |
| `wme-map-mouse-down` / `-up` / `-move` / `-out` | Mouse pointer events over the map viewport. |
| `wme-map-layer-added` / `-changed` / `-removed` | Map layer added, visibility changed, or removed. |
| `wme-user-settings-changed` | User settings updated. |
| `wme-save-mode-changed` | Save button state changed (`event.saveMode`). |
| `wme-save-finished` | Save attempt completed (`event.success` boolean). |
| `wme-after-edit` | Create, edit, or delete performed (contains affected object IDs and types). |
| `wme-after-undo` / `wme-after-redo-clear` / `wme-no-edits` | Undo/redo stack transitions. |
| `wme-layer-checkbox-toggled` | Custom layer switcher checkbox toggled (`event.name`, `event.checked`). |
| `wme-sidebar-tab-opened` | Sidebar tab opened (`event.tabName`, `event.domId`). |
| `wme-street-view-*` | Street View button activation and panel visibility events. |
| `wme-house-number-*` | House number markers added, updated, moved, or deleted. |

### Data Model Events Tracking
Model events must be explicitly tracked:
```typescript
// 1. Start tracking
sdk.Events.trackDataModelEvents({ dataModelName: "segments" });

// 2. Listen to event
sdk.Events.on({
  eventName: "wme-data-model-objects-changed",
  eventHandler: ({ dataModelName, objectIds }) => {
    console.log(`Updated ${dataModelName}:`, objectIds);
  },
});

// Available model events:
// - "wme-data-model-objects-added"
// - "wme-data-model-objects-changed"
// - "wme-data-model-objects-removed"
// - "wme-data-model-objects-saved"
// - "wme-data-model-object-changed-id"
// - "wme-data-model-object-state-deleted"

// 3. Stop tracking when no longer needed
sdk.Events.stopDataModelEventsTracking({ dataModelName: "segments" });
```

### Layer Events Tracking
```typescript
// Track custom or built-in layers (WME_LAYER_NAMES)
sdk.Events.trackLayerEvents({ layerName: "my_custom_layer" });

sdk.Events.on({
  eventName: "wme-layer-feature-clicked",
  eventHandler: (detail) => { /* handle click */ },
});

// Available layer events:
// - "wme-layer-visibility-changed"
// - "wme-layer-feature-clicked"
// - "wme-layer-feature-mouse-enter"
// - "wme-layer-feature-mouse-leave"

sdk.Events.stopLayerEventsTracking({ layerName: "my_custom_layer" });
```

---

## 5. Working with Complex Geometries (Turf.js)

The SDK accepts atomic GeoJSON geometries (`Point`, `LineString`, `Polygon`). Use Turf.js to flatten multi-part geometries:

```typescript
import { flatten } from "@turf/flatten";

const multiPolygonFeature = {
  type: "Feature",
  properties: { name: "Sample" },
  geometry: {
    type: "MultiPolygon",
    coordinates: [ /* ... */ ],
  },
};

const flattened = flatten(multiPolygonFeature);
const featuresToAdd = flattened.features.map((feature, index) => ({
  geometry: feature.geometry,
  id: `geometry-${index}`,
  properties: feature.properties,
  type: feature.type,
}));

sdk.Map.addFeaturesToLayer({
  features: featuresToAdd,
  layerName: "my_layer",
});
```

---

## 6. Migration Guide (Legacy WME vs. SDK)

| Pre-SDK Legacy Usage | SDK Method / Replacement |
| :--- | :--- |
| `W.accelerators` | `sdk.Shortcuts.createShortcut()` |
| `W.app.getAppRegionCode()` | `sdk.Settings.getRegionCode()` |
| `W.loginManager.user` | `sdk.State.userInfo` |
| `W.loginManager.isLoggedIn()` | `sdk.State.userInfo !== null` |
| `W.controller.reloadData()` | `sdk.DataModel.refreshData()` |
| `W.controller.save()` | `sdk.Editing.save()` |
| `W.prefs.get()`, `W.prefs.set()` | `sdk.Settings.getUserSettings()`, `sdk.Settings.setUserSettings()` |
| `W.prefs.on('change')` | Event `wme-user-settings-changed` |
| `I18n.currentLocale()`, `I18n.locale` | `sdk.Settings.getLocale()` |
| `W.model.isImperial` | `sdk.Settings.getUserSettings().isImperial` |
| `W.model.isLeftHand` | `sdk.DataModel.Countries.getTopCountry().isLeftHandTraffic` |
| `W.model.getTopCountry()` | `sdk.DataModel.Countries.getTopCountry()` |
| `W.model.getTopState()` | `sdk.DataModel.States.getTopState()` |
| `W.model.*.getObjectArray()`, `W.model.*.objects` | `sdk.DataModel.<Entity>.getAll()` |
| `W.model.*.getObjectById(id)`, `W.model.*.get(id)` | `sdk.DataModel.<Entity>.getById({ id })` |
| `W.model.*.on()`, `W.model.*.off()` | `sdk.Events.trackDataModelEvents()` + `sdk.Events.on()` |
| `W.model.getTurnGraph()` | `sdk.DataModel.Turns` methods |
| `W.selectionManager.getSelectedFeatures()` | `sdk.Editing.getSelectedFeatures()` |
| `W.selectionManager.setSelectedModels()` | `sdk.Editing.setSelectedFeatures()` |
| `W.selectionManager.events` | Event `wme-selection-changed` |
| `W.userscripts.registerSidebarTab()` | `sdk.Sidebar.registerScriptTab()` (returns Promise for elements) |
| `W.map.getViewportElement()` | `sdk.Map.getMapViewportElement()` |
| `W.map.getExtent()`, `W.map.getOLExtent()` | `sdk.Map.getExtent()` |
| `W.map.zoom` | `sdk.Map.getZoomLevel()` |
| `W.map.getLonLatFromPixel()` | `sdk.Map.getLonLatFromPixel()` |
| `OpenLayers.LonLat` | Plain object `{ lon: number, lat: number }` |
| `OpenLayers.Geometry.LineString/Point/Polygon` | Plain GeoJSON geometry `{ type: "LineString", coordinates: [...] }` |
| `OpenLayers.Layer.Vector` / `W.map.addUniqueLayer()` | `sdk.Map.addLayer()` |
| `OpenLayers.Control.DrawFeature` | `sdk.Map.draw*()` methods |
| `Waze/Action/AddSegment` | `sdk.DataModel.Segments.addSegment()` |
| `Waze/Action/DeleteSegment` | `sdk.DataModel.Segments.deleteSegment()` |
| `Waze/Action/UpdateSegmentGeometry` | `sdk.DataModel.Segments.updateSegment()` |
| `Waze/Action/SplitSegments` | `sdk.DataModel.Segments.splitSegment()` |
| `Waze/Action/MergeSegments` | `sdk.DataModel.Segments.mergeSegments()` |
| `Waze/Action/AddLandmark` | `sdk.DataModel.Venues.addVenue()` |
| `Waze/Action/DeleteObject` | `sdk.DataModel.<Entity>.delete<Entity>()` |
| `Waze/Action/SetTurn` | `sdk.DataModel.Turns.updateTurn()` |
| `Waze/Action/MoveNode` | `sdk.DataModel.Nodes.moveNode()` |
| `Waze/Action/ModifyAllConnections` | `sdk.DataModel.Nodes.allowNodeTurns()` |
| `Waze/Action/AddOrGetStreet` | `sdk.DataModel.Streets.getStreet()` / `sdk.DataModel.Streets.addStreet()` |
| `Waze/Action/AddOrGetCity` | `sdk.DataModel.Cities.getCity()` / `sdk.DataModel.Cities.addCity()` |
| `Waze/Action/AddHouseNumber`, `UpdateHouseNumber`, `MoveHouseNumber` | `sdk.DataModel.HouseNumbers.*` |
