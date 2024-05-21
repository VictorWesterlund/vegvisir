<p align="center">
<img src="https://github.com/VictorWesterlund/vegvisir/assets/35688133/4c33189e-eb70-4dab-82ae-8f0f404e1a0a"
</p>
<h1 align="center">Vegvisir</h1>
<p align="center">Reflect is a web framework written in- and for PHP and JavaScript. The framework handles navigation and interactions, nothing more.</p>

<h2 align="center">Key Features</h2>

- **Multi-threaded**: Requests to pages are loaded and processed in a separate Worker-thread.
- **Page-specific assets**: CSS and JavaScript is minified and injected along with loaded pages.
- **Native PHP templating**: Pure PHP templating with PHP's ["alternative syntax for control structures"](https://www.php.net/manual/en/control-structures.alternative-syntax.php)
- **Top-level soft-navigation**: User navigation between pages will not update your webapp/website skeleton.
- **Page asset injection**: Import CSS and JS asset files as minified inline styles and scripts.
- **Soft-navigation of any element**: Load pages/modules into a specific HTMLElement with [`targetElement` position syntax](https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentElement#position).

This is an example of what the source of a simple web page can look like

```
HTTP GET https://example.com/my-page
```
```php
// File: /pages/my-page.php

// Import and minify CSS file
<style><?= VV::css("pages/my-page.css") ?></style>

<section>
  <h2>Hello world"</h2>
</section>

// Import and minify JavaScript file: /assets/js/pages/my-page.js
<style><?= VV::js("pages/my-page.js") ?></style>
```

---

> [!WARNING]
> Technical documentation for Vegvisir is very incomplete, and user guides essentially missing. I am acutely aware of this and will make an effort to write documentation for this framework.

---

Vegvisir does not come bundled with page controllers, CSS safety nets, database connectors, sendmail hooks, or anything like that. It will **only** soft-navigate between pages and optionally allow you to define page-specific event handlers.

![meme](https://user-images.githubusercontent.com/35688133/204326222-236a71be-5ea3-4653-8caa-6f6cfcd0d0d6.png)

*Vegvisir is not this*

## More examples

### Navigating between pages
```
HTTP GET https://example.com/page-one
```
```php
# File: /pages/page-one.php
<a vv="page-one-namespace" vv-call="gotoPageTwo" href="/page-two">To page two</a>
<script><?= VV::js("pages/page-one") ?></script>
```
```js
// File: /assets/js/pages/page-one.js
new vv.Interactions("page-one-namespace", {
  gotoPageTwo: (event) => new vv.Navigation(event.target.href).navigate();
});
```

> [!TIP]
> Adding `vv-call="navigate"` to an anchor tag will take care of top navigations without the need to define a method for its namespace.
> 
> `<a href="/" vv="some-namespace" vv-call="navigate">Take care of navigation to /</a>`

### Navigate an element

Passing an `HTMLElement` as an argument to `vv.Navigation.navigate()` will replace inner DOM of that element with the DOM of the requested page.

```js
new vv.Navigation("/some-page").navigate(document.querySelector("some-element")); // Replaces the inner DOM of <some-element> with the DOM of /some-page
```

# Support

<table>
  <thead>
    <tr>
      <th rowspan="2">PHP</th>
      <th colspan="3">Browsers</th>
    </tr>
    <tr align="center">
      <th>Chromium</th>
      <th>Gecko</th>
      <th>WebKit</th>
    </tr>
  </thead>
  <tbody>
    <tr align="center">
      <td><img src="https://github.com/VictorWesterlund/vegvisir/assets/35688133/a1a78138-5cef-4ba1-8dca-928eb32ebe9d"/></td>
      <td><img src="https://user-images.githubusercontent.com/35688133/230028928-dca1467d-8c63-4e69-9524-78e5751eaf24.png"/></td>
      <td><img src="https://user-images.githubusercontent.com/35688133/230029200-624d0126-9640-4b78-9eb5-a2e4be4e51be.png"/></td>
      <td><img src="https://user-images.githubusercontent.com/35688133/230029381-e7162ba1-e9ef-4b34-803f-043b5d16d365.png"/></td>
    </tr>
    <tr>
      <td>✅ Version 8.2+</td>
      <td>✅ Version 80+</td>
      <td>✅ Version 75+</td>
      <td>✅ Version 14.1+</td>
    </tr>
  </tbody>
</table>
