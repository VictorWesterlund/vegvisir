# Pragma

Build websites the way you want. This framework is designed to interfere *as little as possible* with how you write your code and let you decide how your website should look, feel, and behave. This framework will take care of interactions, navigation, and asset imports; only.

## 🤷 What's the point?

**TLDR;**

![meme](https://user-images.githubusercontent.com/35688133/204326222-236a71be-5ea3-4653-8caa-6f6cfcd0d0d6.png)

Pragma is a foundation for a vanilla PHP website (with optional vanilla JS and CSS). It wont abstract away stuff like connecting to databases, sending emails, or call APIs.

---

Check out [GeneMate<sup>®</sup> by iCellate](https://genemate.se) if you wish to see Pragma used in production.

---

## Example

No bells and whistles? Build static websites with only one page.

"/pages/{locale}/document.php" contains the following:
```php
<html>
<head>
  <!-- Will import and minify the CSS file at "/assets/css/pages/style.css" -->
  <style><?= Page::css("pages/style") ?></style>
</head>
<body>
  <h1>Hello world</h1>
  <!-- Pragma will expose your "/assets" folder as static content -->
  <img src="/assets/media/coolpic.webp" alt="A cool picture"/>
  <!-- Using data-trigger will call the method with data-action -->
  <button data-trigger="document" data-trigger="myCoolMethod">Click to say the magic word!</button>
  <!-- This will load in Pragma's interaction and navigation handlers -->
  <script><?= Page::init() ?></script>
  <!-- Will import and minify the JS file at "/assets/js/pages/script.js" -->
  <script><?= Page::js("pages/script") ?></script>
</body>
</html>
```

"/assets/js/pages/document.js" contains the following:
```js
// "document" makes this block listen for data-trigger="document" elements, it's basically which scope.
globalThis.pragma.Interaction("document", {
  // And "myCoolMethod" here was defined by data-action="myCoolMethod".
  myCoolMethod: (event) => {
    alert("Please!");
  }
});
```

<details>
<summary>🌲 Click to view directory tree</summary>

```bash
/
├── assets
│   ├── css
│   │   └── pages
│   │       └── style.css
│   ├── js
│   │   └── pages
│   │       └── script.js
│   └── media
│       └── coolpic.webp
└── pages
   └── EN_EN
       └── document.php
```
</details>

### A simple website in Pragma

Let's say we want to build a simple two-page website. A langingpage and a contact page.

Pragma uses SPA-style loading to inject the contents of a page into a target element.

[**You can read more about page loading in Pragma here**](#todo)

<details>
<summary>📜 Click to view code</summary>

*/pages/EN_EN/document.php*<br>
*This will be the "skeleton". The markdown that is persistant accross pages*

```php
<html>
<head>
  <!-- Will import and minify the CSS file at "/assets/css/pages/style.css" -->
  <style><?= Page::css("document") ?></style>
</head>
<body>
  <!-- The <main> element will have its markdown replaced on top navigations -->
  <main>
    <!-- The PHP file matching the locale and path in "/pages/<locale>/<path>.php" will get loaded here. -->
    <!-- If request is to landingpage ("/") the "/pages/<locale>/main.php" page will get loaded. -->
  </main>
  <!-- Will import and minify the JS file at "/assets/js/pages/script.js" -->
  <script><? Page::js("document") ?></script>
</body>
</html>
```

*/pages/EN_EN/index.php*<br>
*This is the landingpage (or any other page on the website)*

```php
<!-- Will import and minify the CSS file at "/assets/css/pages/style.css" -->
<style><?= Page::css("pages/index") ?></style>
<section id="landingpage">
  <p>Welcome to my cool website.</p>
  <!-- "data-trigger" will make this element emit a PointerEvent when interacted with. -->
  <!-- The value "index" of this attribute defines the page JS that should receive the event. -->
  <a href="/contact" data-trigger="index">Contact me</a>
  <a href="/contact" data-trigger="index">Contact me, but this time</a>
</section>
<script><? Page::js("pages/index") ?></script>
```

*/pages/EN_EN/contact.php*<br>
*This page imports some custom PHP to handle the POST data*

```php
<!-- Run page-specific PHP code -->
<?php 

  // The "Path::root()" static method will return a path (string) to your folder wherever it is on disk
  require_once Path::root("controller/ContactForm.php";
  
  if ($_SERVER["REQUEST_METHOD"] === "POST") {
    (new ContactForm($_POST))->do_something();
  }
  
?>
<!-- Will import and minify the CSS file at "/assets/css/pages/style.css" -->
<style><?= Page::css("pages/contact") ?></style>
<section id="contact">
  <form method="POST">
    <textarea name="message"></textarea>
    <input type="submit" value="Send"></input>
  </form>
</section>
<script><? Page::js("pages/contact") ?></script>
```
</details>
<details>
<summary>🌲 Click to view directory tree</summary>

```bash
/
├── assets
│   ├── css
│   │   ├── pages
│   │   │   ├── main.css
│   │   │   ├── contact.css
│   │   └── document.css
│   ├── js
│   │   ├── pages
│   │   │   ├── main.js
│   │   │   ├── contact.js
│   │   └── document.js
│   └── media
│       └── coolpic.webp
└── pages
   └── EN_EN
       ├── document.php
       ├── main.php
       └── contact.php
```
</details>

## A *sample* website in Pragma

[This is a sample website built with Pragma](#todo)

# Installation

Check out the INSTALL.md file for instructions.
