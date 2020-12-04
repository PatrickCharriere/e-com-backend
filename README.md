# Setup your 100% customized API for free

Server based on on Strapi framework.

This is a great opportunity for you to create your own dedicated server and APIs to serve and store every information you might need within your custom app!

It can store restaurants, blog posts, e-commerce products or anything you'd like to have in a database.

This tuto is organized like so:

0. Introduction
1. Setup online server
2. Install Nginx on your server
3. Secure your server with HTTPS
4. Set HTTP2 to improve reactivity

## 0 Intro

In this introduction, we'll see how to setup a complete server from scratch and for completely for free, based on Strapi, AWS EC2 and RDS.

We'll setup the server and its database to be online with your custom domain name and HTTPS certificate!

This text is based on 3 different tutorials that you may choose to follow individually as they're really well described. Here they are:
1. https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-18-04
2. https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-18-04
3. https://www.digitalocean.com/community/tutorials/how-to-set-up-nginx-with-http-2-support-on-ubuntu-18-04

### 0.a. Requirements

This server setup, even if it can be 100% free using AWS free tiers will require to enter credit card details in case you would upgrade your machines later on.

## 1 Setup online server

To setup an online server, you'll need a ubuntu running machine somewhere on the internet with a dedicated IP address to access it.

AWS EC2 can provide you one for free but be aware that they aren't the only one to offer this service. You may thing about Google Cloud Platform, Microsoft Azure, Digital Ocean or many other providers.

The main thing bringing me to AWS is their free tier option that will allow me to setup a server and a database for free at least for my development phase. TBH, I recently tried the Digital Ocean option witch isn't free. I finally found a $100 redeem coupon available for 60 days so I created an account. The online machine is very similar, you wouldn't notice the difference expect from 1 point: the location. Currently based in Australia, the closest option for me on Digital Ocean was a machine based in Singapore (when Amazon offers a machine based in Sydney). I could feel the difference when connecting using SSH, the Singapore machine was significantly longer to display entered characters. So I tried a `ping` to compare the latency (from Brisbane Australia):
1. Sydney: ~15ms
2. Singapore: ~110ms

The choice is entirely up to you depending on your specific location and the closest machines but consider first having a look at the locations when you decide which provider to use ;)

So with AWS it would give this: Create an EC2 instance based on your location you can chose to use the free tier option.

![alt-text](https://user-images.githubusercontent.com/10613478/101115451-1fcfb180-362f-11eb-8187-9eae8da9e2e6.png)

Store the SSH private key with caution and connect to your machine using command line:
`ssh -i /Path/to/your/key.pem ubuntu@[server_ip_address]`

### 1.a. Setup a dedicated domain name (optional)

If you don't want to use the IP address of your server, and if you will want a HTTPS certificate, you need to use a domain name.

Go on https://my.freenom.com/ for example to get a free domain name. I personnaly chose a free domain in .tk for 12 months because I don't really care about my backend address, I just want it to be stable.

Then under `manage domain` > `manage freenom DNS` enter the two "A" rules for empty and "WWW", leave the TTL as is and pop your server IP in the `target` column.

You may have to wait some minutes or hours for your changes to be spread through the DNS network. Check when the change is actually done entering your domain name till it matches with your server IP using an online tool such as:
1. https://www.ultratools.com/tools/ipWhoisLookup
2. https://whois.domaintools.com/
3. https://www.whatismyip.com/dns-lookup/

Remember to always update your Freenom DNS config every time your server IP changes.

__You now have an online server with a custom domain name that you can access through `ssh`__

`ssh -i /Path/to/your/ssh/key.pem ubuntu@your_custom_domain.tk`

### 1.b. Possible error cases

Here I've got an error on key file permissions:

```
Permissions 0644 for '/Users/.../ec2-dev.pem' are too open.
It is required that your private key files are NOT accessible by others.
This private key will be ignored.
Load key "/Users/.../ec2-dev.pem": bad permissions
ubuntu@my-domain.tk: Permission denied (publickey,gssapi-keyex,gssapi-with-mic).
```

I tried to fix that by running `chmod 400 mykey.pem` on the key file but unfortunately didn't work.

It turned out that the user name I was using was wrong. Instead of trying to connect with `ubuntu` I had to use `ec2-user` but it was because __I created an EC2 instance based on WRONG amazon linux image instead of the ubuntu one__. So I had to delete my ec2 instance and start a new one based on the right ubuntu image (see screenshot attached in section 1).

## 2 Install Nginx server

This section is mainly based on https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-18-04

Run `sudo apt update` and `sudo apt upgrade` then `y` and `enter` to confirm and update your ubuntu packages and dependecies.

Then run `sudo apt install nginx` then `y` and `enter` again.

Run: `sudo ufw app list`

It should display the following:

```
Available applications:
  Nginx Full
  Nginx HTTP
  Nginx HTTPS
  OpenSSH
```

Then enable HTTP by typing `sudo ufw allow 'Nginx HTTP'` in the console and check that the result with `sudo ufw status` is:

```
Status: active

To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere                  
Nginx HTTP                 ALLOW       Anywhere                  
OpenSSH (v6)               ALLOW       Anywhere (v6)             
Nginx HTTP (v6)            ALLOW       Anywhere (v6)
```

### Possible error case:

If `sudo ufw status` gives you `Status: inactive` you can use `sudo ufw enable` and `sudo ufw allow 'OpenSSH'` if it doesn't appear in the list straight away. Check that you get the correct output with `sudo ufw status` and restart the server with `sudo systemctl restart nginx`.

Make sure that Nginx server is running by typing `systemctl status nginx`:

```
● nginx.service - A high performance web server and a reverse proxy server
   Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
   Active: active (running) since Fri 2018-04-20 16:08:19 UTC; 3 days ago
     Docs: man:nginx(8)
 Main PID: 2369 (nginx)
    Tasks: 2 (limit: 1153)
   CGroup: /system.slice/nginx.service
           ├─2369 nginx: master process /usr/sbin/nginx -g daemon on; master_process on;
           └─2380 nginx: worker process
```

From now on you should be able to access to your server using HTTP like so: `http://your_server_ip_or_domain_name`

![alt text](https://assets.digitalocean.com/articles/nginx_1604/default_page.png "Default Nginx page")

### Possible error case:

From here you might not be able to see your website responding yet. Indeed you might have to update the security rules on AWS to allow connection from HTTP on your machine. To do that, go to your `EC2` dashboard then from the navigation menu (on the left on a computer) click on your instance id in the instances list. Then click on the `Security` tab and then on the security group that might look like that: `sg-0d9e391f87093b840 (launch-wizard-2)`. Click on the `Edit inbound rules` button and add a `HTTP` allowance from everywhere (or only from your computer if you're always working from the same address and that you want to be the only one allowed).

![alt text](https://user-images.githubusercontent.com/10613478/101118064-16951380-3634-11eb-858d-422e7fa88838.png)

## 3 Secure your server with HTTPS

This section is mainly based on https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-18-04

`sudo add-apt-repository ppa:certbot/certbot` and press `Enter`

`sudo apt install python3-certbot-nginx` and press `y` when asked to confirm.

Create a file called after your domain name `sudo nano /etc/nginx/sites-available/your_custom_domain.tk` with the following content (replacing `your_custom_domain` with your actual domain name from Freenom):

```
server {

	if ($host = www.your_custom_domain.tk) {
		return 301 https://$host$request_uri;
	} # managed by Certbot

	if ($host = your_custom_domain.tk) {
		return 301 https://$host$request_uri;
	} # managed by Certbot

	listen 80;
	listen [::]:80;
	# Redirect HTTP to HTTPS
	return 301 https://$host$request_uri;

	server_name your_custom_domain.tk www.your_custom_domain.tk;

}

server {	

	root /var/www/your_custom_domain.tk/html;
	index index.html index.htm index.nginx-debian.html;

	server_name your_custom_domain.tk www.your_custom_domain.tk;

	listen [::]:443 ssl http2 ipv6only=on; # managed by Certbot
	listen 443 ssl http2; # managed by Certbot
	#ssl_certificate /etc/letsencrypt/live/your_custom_domain.tk/fullchain.pem; # managed by Certbot
	#ssl_certificate_key /etc/letsencrypt/live/your_custom_domain.tk/privkey.pem; # managed by Certbot
	include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
	ssl_ciphers EECDH+CHACHA20:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5;
	ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

	location / {
		proxy_set_header   X-Forwarded-For $remote_addr;
		proxy_set_header   Host $http_host;
		proxy_pass         "http://127.0.0.1:1337";
		proxy_http_version 1.1;
		proxy_set_header X-Forwarded-Host $host;
		proxy_set_header X-Forwarded-Server $host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
		proxy_set_header Host $http_host;
		proxy_set_header Upgrade $http_upgrade;
		proxy_set_header Connection "Upgrade";
		proxy_pass_request_headers on;
		proxy_headers_hash_max_size 512;
		proxy_headers_hash_bucket_size 128;
	}

}
```

Check that your file's syntax is ok with the command `sudo nginx -t`:

```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

Then reload your server with: `sudo systemctl reload nginx`

You might also have to update your Security Inbound rules to add access from HTTPS as done earlier with HTTP.

Add the custom rules for the firewall like so 
```
sudo ufw allow 'Nginx Full'
sudo ufw delete allow 'Nginx HTTP'
```

Obtain your HTTPS certificate from certbot : `sudo certbot --nginx -d`. Enter a correct e-mail address that will receive an extremely handy e-mail before this certificate expires allowing you to renew it on time ;)

Uncomment the two lines beggining with `ssl_certificate` and `ssl_certificate_key` in your `/etc/nginx/sites-available/your_custom_domain.tk` file and restart your server `sudo systemctl reload nginx` if its config is ok `sudo nginx -t`.

Check that you get the Nginx welcome page when accessing `https://you_custom_domain.tk`.

You can check the certificate auto renewal with the following command: `sudo certbot renew --dry-run`.

## 4. Set HTTP2 to improve your server's reactivity

