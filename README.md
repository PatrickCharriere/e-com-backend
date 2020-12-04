# Setup your 100% customized API for free

Server based on on Strapi framework.

This is a great opportunity for you to create your own dedicated server and APIs to serve and store every information you might need within your custom app!

It can store restaurants, blog posts, e-commerce products or anything you'd like to have in a database.

## Intro

In this introduction, we'll see how to setup a complete server from scratch and for completely for free, based on Strapi, AWS EC2 and RDS.

We'll setup the server and its database to be online with your custom domain name and HTTPS certificate!

This text is based on 3 different tutorials that you may choose to follow individually as they're really well described. Here they are:
1. https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-18-04
2. https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-18-04
3. https://www.digitalocean.com/community/tutorials/how-to-set-up-nginx-with-http-2-support-on-ubuntu-18-04

## Requirements

This server setup, even if it can be 100% free using AWS free tiers will require to enter credit card details in case you would upgrade your machines later on.

## Steps

### 1 Setup online server

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

#### 1.a. Setup a dedicated domain name (optional)

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

#### 1.b. Possible error cases

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

### 2 Install Nginx server

This tuto section is mainly based on https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-18-04

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

#### Possible error case:
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

#### Possible error case:

From here you might not be able to see your website responding yet. Indeed you might have to update the security rules on AWS to allow connection from HTTP on your machine. To do that, go to your `EC2` dashboard then from the navigation menu (on the left on a computer) click on your instance id in the instances list. Then click on the `Security` tab and then on the security group that might look like that: `sg-0d9e391f87093b840 (launch-wizard-2)`. Click on the `Edit inbound rules` button and add a `HTTP` allowance from everywhere (or only from your computer if you're always working from the same address and that you want to be the only one allowed).

![alt text](https://user-images.githubusercontent.com/10613478/101118064-16951380-3634-11eb-858d-422e7fa88838.png)

