# SnapScroll

A lightweight, responsive, and customizable horizontal scroll snapping library for modern web projects.
Here is the live: [easysnap](https://willem-aw.github.io/easyscrollsnap/)

---

## 🚀 Features

- Horizontal scroll snapping for any container  
- Configurable number of items to show and scroll  
- Navigation arrows and pagination dots (optional)  
- Responsive breakpoints for different screen sizes  
- Mouse and touch drag support  
- Zero dependencies  

---

## 📦 Installation

**Include the JS file in your project:**

```html
<script src="cs-snap-lib.js"></script>
```

**Or import as a module if you bundle:**

```js
import SnapScroll from './cs-snap-lib.js';
```

---

## 🛠️ Usage

### HTML:

```html
<div class="my-scroll-container">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <!-- ... -->
</div>
```

### JavaScript:

```js
const snap = new SnapScroll('.my-scroll-container', {
  itemsToShow: 3,
  itemsToScroll: 2,
  gap: 16,
  navigation: true,
  dots: true,
  responsive: {
    768: { itemsToShow: 2, itemsToScroll: 1 },
    1024: { itemsToShow: 4, itemsToScroll: 2 }
  }
});
```

**Or using the factory function:**

```js
window.snapScroll('.my-scroll-container', { /* options */ });
```

---

## ⚙️ Options

| Option         | Type     | Default | Description                                 |
| -------------- | -------- | ------- | ------------------------------------------- |
| `itemsToShow`  | Number   | `1`     | Number of items visible at once             |
| `itemsToScroll`| Number   | `1`     | Number of items to scroll per navigation    |
| `snapDuration` | Number   | `300`   | Duration of snap animation (ms)             |
| `gap`          | Number   | `20`    | Gap (px) between items                      |
| `navigation`   | Boolean  | `true`  | Show navigation arrows                      |
| `dots`         | Boolean  | `false` | Show pagination dots                        |
| `responsive`   | Object   | `null`  | Responsive breakpoints (see below)          |

### 📱 Responsive Option

Define breakpoints as an object, where the key is the minimum container width (in px):

```js
responsive: {
  768: { itemsToShow: 2, itemsToScroll: 1 },
  1024: { itemsToShow: 4, itemsToScroll: 2 }
}
```

---

## 📘 API

### Constructor

```js
const snap = new SnapScroll(container, options);
```

- `container`: HTMLElement or selector string  
- `options`: *(optional)* configuration object

---

### Methods

#### `update(config)`
Update options and refresh layout.

```js
snap.update({ itemsToShow: 2 });
```

#### `prev()`
Scroll to the previous set of items.

```js
snap.prev();
```

#### `next()`
Scroll to the next set of items.

```js
snap.next();
```

#### `scrollTo(index)`
Scroll to a specific group of items (zero-based).

```js
snap.scrollTo(2);
```

#### `destroy()`
Remove all event listeners and DOM changes.

```js
snap.destroy();
```
