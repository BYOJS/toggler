# Toggler

[![npm Module](https://badge.fury.io/js/@byojs%2Ftoggler.svg)](https://www.npmjs.org/package/@byojs/toggler)
[![License](https://img.shields.io/badge/license-MIT-a1356a)](LICENSE.txt)

**Toggler** is a tool to asynchronously toggle between two operations, using [throttled/debounced task scheduling](https://github.com/byojs/scheduler?tab=readme-ov-file#overview).

For example, managing the showing and hiding of a modal (UI blocking) spinner:

```js
var toggle = Toggler(
    /*taskOneDelay=*/250,
    /*taskTwoDelay=*/100
);

// (throttled) toggle on the spinner
toggle(showSpinner,hideSpinner);

// later, (throttled) toggle off the spinner
toggle(showSpinner,hideSpinner);
```

**Note:** This example illustrates asynchronously toggling between showing a spinner and hiding it, with throttling/debouncing and cancellation all managed internally.

----

[Library Tests (Demo)](https://byojs.dev/toggler/)

----

## Overview

The main purpose of **Toggler** is to manage [scheduling (throttling/debouncing)](https://github.com/byojs/scheduler?tab=readme-ov-file#overview) when asynchronously toggling between two tasks.

**Toggler** allows you to specify a *delay* for each of two tasks. It uses this delay to schedule the *next* task -- i.e., it will run *task two* if *task one* most recently ran, or vice versa. Further, if the toggle is re-invoked *during* the scheduling delay for a task, that scheduled task is canceled (state is unchanged).

### Example: Spinner

To illustrate, let's revisit the spinner example from above:

```js
var toggle = Toggler(
    /*taskOneDelay=*/250,
    /*taskTwoDelay=*/100
);

// (throttled) toggle on the spinner
toggle(showSpinner,hideSpinner);

// later, (throttled) toggle off the spinner
toggle(showSpinner,hideSpinner);
```

Here, the first `toggle()` call schedules the `showSpinner()` task to run in `250`ms; if `toggle()` is called again before that has delay has transpired, the scheduled call to `showSpinner()` is canceled (and the spinner stays hidden).

Likewise, if the spinner is visible and `toggle()` is called, `hideSpinner()` is delayed by `100`ms; if `toggle()` is called again before that delay has transpired, the scheduled call to `hideSpinner()` is canceled (and the spinner stays visible).

### Toggling use-cases

The spinner example above is a common use-case for something like **Toggler**. But any UI control that can be toggled between two states is a potential candidate.

For example, you might use **Toggler** to asynchronously manage showing/hiding of hover/long-press tooltips, to avoid UX messy "quick flickering" of tooltips as a user moves their cursor or finger-touch around an interface. A brief delay on both show and hide will generally be friendlier for UX, requiring the user to pause over an element to express more obvious intent, etc. Similar goes for expanding menus/drop-downs.

Another reason to use **Toggler** would be to manage UI operations that involve animation (e.g., a sliding-in and sliding-out side drawer), since it can be very UX jarring for an animation to be interrupted when only partially complete. **Toggler** could for example ensure that once a *show* animation starts, it has a chance to gracefully finish before the element is hidden (either by animation or immediately).

Even more affirmative user events like clicks/taps -- e.g., opening a popup with a calendar or color picker -- can benefit UX with asynchronous toggling, because clicks/taps sometimes happen accidentally while users scroll around UI content.

#### Lag?

As touch interfaces became popular a decade or so ago, many mobile browsers introduced a ~300ms delay before firing *click* events on UI elements, because it was felt for UX reasons that distinguishing between a *tap* and a *touch-and-drag* (or other sophisticated gestures, like *double-tap*, *pinch-to-zoom*, etc) was important.

Unfortunately, for UIs (like games) where the *tap* is the main or only gesture, this across-the-board delay created a laggy feeling. Developers used multiple workarounds to avoid this delay, including [CSS `touch-action: manipulation`](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action#manipulation) and JS libraries like [FastClick](https://github.com/ftlabs/fastclick) (now deprecated).

Luckily, modern browsers/devices are not necessarily applying these delays quite so universally, and there are more ways to handle these various cases and trade-offs.

**Toggler** is intended to be *another tool* in that effort. You can selectively re-introduce a brief delay (even shorter than 300ms) for a specific part of a UI. *And*, you can delay both the *in* and the *out* of a toggleable state -- something the other CSS/JS solutions just mentioned don't handle.

## Deployment / Import

```cmd
npm install @byojs/toggler
```

The [**@byojs/toggler** npm package](https://npmjs.com/package/@byojs/toggler) includes a `dist/` directory with all files you need to deploy **Toggler** (and its dependencies) into your application/project.

**Note:** If you obtain this library via git instead of npm, you'll need to [build `dist/` manually](#re-building-dist) before deployment.

### Using a bundler

If you are using a bundler (Astro, Vite, Webpack, etc) for your web application, you should not need to manually copy any files from `dist/`.

Just `import` like so:

```js
import Toggler from "@byojs/toggler";
```

The bundler tool should pick up and find whatever files (and dependencies) are needed.

### Without using a bundler

If you are not using a bundler (Astro, Vite, Webpack, etc) for your web application, and just deploying the contents of `dist/` as-is without changes (e.g., to `/path/to/js-assets/toggler/`), you'll need an [Import Map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap) in your app's HTML:

```html
<script type="importmap">
{
    "imports": {
        "toggler": "/path/to/js-assets/toggler/toggler.mjs"
    }
}
</script>
```

Now, you'll be able to `import` the library in your app in a friendly/readable way:

```js
import Toggler from "toggler";
```

**Note:** If you omit the above *toggler* import-map entry, you can still `import` **Toggler** by specifying the proper full path to the `toggler.mjs` file.

## Toggler API

The API provided by **Toggler** is a single function -- the default export of the module.

This function receives two integer arguments, to initialize a toggler instance -- represented by another function as its return value -- to [configure dual **byojs/Scheduler** instances](https://github.com/byojs/scheduler?tab=readme-ov-file#scheduler-api). Internally, these two scheduler instances are wired to each other to asynchronously toggle a task between two states, by alternating calls of two functions.

```js
import Toggler from "..";

var toggle = Toggler(
    /*taskOneDelay=*/250,
    /*taskTwoDelay=*/100
);
```

### Toggling Tasks

To toggle between two tasks (function calls), pass them into the *toggler* instance (`toggle()` from above):

```js
// (throttled) toggle on the spinner
toggle(showSpinner,hideSpinner);

// later, (throttled) toggle off the spinner
toggle(showSpinner,hideSpinner);
```

If the second `toggle()` call happens before the first interval has transpired (*taskOneDelay* configured above as `250`ms), the first task (`showSpinner()`) will be canceled. However, if the second `toggle()` call doesn't happen before the first delay interval has transpired, the first task (`showSpinner()`) will complete successfully.

Either way, the second task (`hideSpinner()`) will then be scheduled (*taskTwoDelay* configured above as `100`ms).

The toggling continues back-and-forth between the two tasks, with interval timer and cancelation, indefinitely, as long as the *toggler* instance (again, `toggle()` above) is always called with the same two functions.

You *can* share the same *toggler* instance can for toggling multiple pairs of tasks/functions, assuming the same timing settings should apply for each pair. However, **do not have the same function instance** participating in two or more pairs of toggling, as this will cause unexpected behavior.

**Warning:** The internal tracking of toggling task functions is based on function reference identity. If you pass an inline function expression (such as an `=>` arrow), the function reference will be different each time, and will be treated as entirely separate functions -- thereby breaking the toggle tracking. Make sure to use the same stable function references pair for all toggling.

## Re-building `dist/*`

If you need to rebuild the `dist/*` files for any reason, run:

```cmd
# only needed one time
npm install

npm run build:all
```

## Tests

This library only works in a browser, so its test suite must also be run in a browser.

Visit [`https://byojs.dev/toggler/`](https://byojs.dev/toggler/) and click the "run tests" button.

### Run Locally

To instead run the tests locally, first make sure you've [already run the build](#re-building-dist), then:

```cmd
npm test
```

This will start a static file webserver (no server logic), serving the interactive test page from `http://localhost:8080/`; visit this page in your browser and click the "run tests" button.

By default, the `test/test.js` file imports the code from the `src/*` directly. However, to test against the `dist/*` files (as included in the npm package), you can modify `test/test.js`, updating the `/src` in its `import` statements to `/dist` (see the import-map in `test/index.html` for more details).

## License

[![License](https://img.shields.io/badge/license-MIT-a1356a)](LICENSE.txt)

All code and documentation are (c) 2024 Kyle Simpson and released under the [MIT License](http://getify.mit-license.org/). A copy of the MIT License [is also included](LICENSE.txt).
