# Toggler

[![npm Module](https://badge.fury.io/js/@byojs%2Ftoggler.svg)](https://www.npmjs.org/package/@byojs/toggler)
[![License](https://img.shields.io/badge/license-MIT-a1356a)](LICENSE.txt)

**Toggler** is a tool to asynchronously (throttled) toggle between two operations.

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

----

[Library Tests (Demo)](https://byojs.dev/toggler/)

----

## Overview

The main purpose of **Toggler** is to provide [debouncing and throttling](https://css-tricks.com/debouncing-throttling-explained-examples/) controls for managing async task scheduling.

Both scheduling schemes reduce how many repeated calls to a single function will be processed, over a defined interval of time, but use different strategies for determining when to schedule those calls. And both strategies may operate in two forms: *leading* and *trailing*.

### Throttling

Throttling prevents a repeated function call from being processed more than once per defined interval of time (e.g., 100ms); an interval timer is started with the *first call* (which resets after each interval transpires).

With leading throttling, the initial call is processed immediately, and any subsequent call attempts, during the interval, will be ignored. With trailing throttling, only the last call is processed, *after* the full interval has transpired (since the first attempted call).

### Debouncing

Debouncing resets the delay interval with each attempted call of a function, meaning that the delay of processing an attempted call will continue to increase (unbounded), with each subsequent call attempt during the defined interval.

With leading debouncing, the initial call is immediately processed, after which subsequent calls are debounced; once a full interval transpires without attempted calls, the most recent call is processed. With trailing debouncing, no initial call is processed, and every call is debounced.

Debouncing *might* effectively delay a function call indefinitely, if at least one call attempt is made during each defined interval of time. This is usually not preferred, so you can set an upper bound for the total debouncing delay, after which the most recent call will be processed and the debouncing interval reset.

### Canceling

Any throttled or debounced call that has not yet happened yet, may be canceled before it is processed.

For example, you might debounce the initial display of a spinner (e.g., 500ms) for an async task that can vary in duration (like a network request); debouncing prevents the spinner from flashing visible and then being hidden very quickly -- if the network request finishes very quickly. But if the network request finishes even faster than the 500ms, you can cancel the scheduled display of the spinner.

**Tip:** Debouncing the spinner showing, as described, still risks a potential UX hiccup. The network request might finish shortly after the debounce interval delay has transpired, which still quickly flickers the spinner. And this gets even worse if a subsequent async operation might be triggered (debounced) right after, such that the user might see a series of spinner flickers (on and off). One solution is to *also* debounce the canceling of a previous operation's debounce. In other words, the spinner might delay in being shown, but once shown, delay in its hiding. This approach [is essentially a debounced toggle (see **byojs/Toggler**)](https://github.com/byojs/toggler).

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
