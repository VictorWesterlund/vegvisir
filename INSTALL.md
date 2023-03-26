# 📥 Installation

To install Pragma locally you need the following prerequisites
* A webserver (preferably NGINX 1.18+)
* PHP 8.1+ (preferably PHP-FPM)
* [Composer](https://getcomposer.org/)

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