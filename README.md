# Pragma

Build websites the way you want. This framework is designed to interfere *as little as possible* with how you write your code and let you decide how your website should look and behave. It covers the basics of an otherwise vanilla PHP, JavaScript, and CSS website - that don't rely on preprocessors (such as SASS or TypeScript) offered by the framework itself, *but those features can of course be implemented downstream*.

## 🤷 What's the point?

Frameworks today tend to encourage developers to follow certain rules when making new websites. *This is of course useful* and those frameworks should ***probaby*** be used instead. The goal of Pragma is to tackle *only* the following when the goal is to build a website *from sratch*:

- Navigation (SPA-like)
- Localization
- Interaction
- Bundling

The rest is up to the developer to figure out.

![meme](https://user-images.githubusercontent.com/35688133/204326222-236a71be-5ea3-4653-8caa-6f6cfcd0d0d6.png)

This is what Pragma is trying to solve. Need to connect to a database, need to send automatic mails? Do it your way!

# Examples

Check out the [GeneMate<sup>®</sup> by iCellate](https://genemate.se) website, which spawned this project, if you wish to see Pragma used in production. And here are a few examples of how websites can be built with Pragma:

### The simplest website in Pragma

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
  <!-- Will import and minify the JS file at "/assets/js/pages/script.js" -->
  <script><? Page::js("pages/script") ?></script>
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

# 📥 Installation

To install Pragma locally you need the following prerequisites
* A webserver (preferably NGINX 1.18+)
* PHP 8.1+ (preferably PHP-FPM)
* [The composer package manager](https://getcomposer.org/)

Assuming you have all that set up, here's how to get Pragma up and running on Debian-based systems:


1. **Clone the repo**
```sh
$ git clone https://github.com/VictorWesterlund/pragma
```

2. **Install dependencies**
```sh
$ composer install --optimize-autoloader
```

3. **Point server root**
   
   > **Note** Pragma does not come with an executable to spin up a dev server. So these instructions will apply for both live and local environments
   
   Configure your webserver to route *all traffic* to your website to `{path-to-pragma-root}/public/index.php`. Pragma handles request routing automatically.
   
   <details>
   <summary>Example with NGINX</summary>
   
   * Point the root of a virtual host on your webserver to the `/public` folder in this repo.
      - This location should redirect all URIs to the `/public/index.php` file. This in turn
        will spin up the internal request router which will handle API calls and everything.
        
        ```nginx
        root /path/to/pragma/public;
        
        location ~ /* {
           try_files /index.php =503;
           
           # You need to comment-out the "try_files" line in fastcgi-php.conf as we define it here instead
           include snippets/fastcgi-php.conf;
           fastcgi_pass unix:/run/php/php8.1-fpm.sock;
        } 
        ```
        
        
   * ⚡ (Optional) For better performance with NGINX: Add a location for your `/assets/*` folder in your webpage (not Pragma)
     - NGINX is really good at serving static content. Bypass the `fastcgi_proxy` by matching a
       location block for all requests to `/assets/*` with the following:
       
       ```nginx
       location ~ /assets/* {
           root /path/to/your/website/assets;
           try_files $uri $uri/ =404;
           # ... other stuff
       }
       ```
       
       This step is of course not required. Pragma will serve static assets automatically, but letting NGINX handle them directly is much faster.
   </details>
       
4. **Set site path**

   Copy the file `.env.example.ini` to `.env.ini` and update the `site_path` variable with the absolute location to your website contents.
   
   ```ini
   ; Example
   site_path="/path/to/your/website/"
   ```
   
Et voilà! Navigate to the host you defined in your webserver config.
