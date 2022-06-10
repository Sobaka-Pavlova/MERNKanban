## CHECK OUT THE [DEMO](http://147.182.154.42)

- [Overview](#overview)
  - [Requirements](#requirements)
  - [Development](#development)
    - [Quickstart](#quickstart)
  - [Production](#production)

# Overview

Straightforward Kanban Board to visualize your productivity and maximize efficiency. 

Learn more about [Agile](https://en.wikipedia.org/wiki/Agile_software_development).

## Requirements

- [Nodejs](https://nodejs.org/en/)
  - You'll know you've installed nodejs right if you can run:
    - `node -v` and get an ouput like: `16.3.2`
- [Yarn](https://yarnpkg.com/getting-started/install) instead of `npm`
  - You'll know you've installed yarn right if you can run:
    - `yarn --version` and get an output like: `1.22.18`
    - You might need to [install it with `npm`](https://classic.yarnpkg.com/lang/en/docs/install/) or `corepack`
- [Docker](https://docs.docker.com/engine/install/)
  - You'll know you did it right if you can run `docker -v` and you see a response like `Docker version 20.10.12`
- [Docker-Compose](https://docs.docker.com/compose/)
  - You'll know you did it right if you can run `docker-compose -v` and you see a response like `Docker Compose version v2.4.1`
- [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
  - You'll know you did it right if you can run `git --version` and you see a response like `git version x.x.x`
- [MongoAtlas](https://mongodb.com)
  - Sign up with Mongo
  - Create a cluster
  - Click `Connect` => `Connect your application`
  - Save the connection string in .env file


## Development

### Quickstart

0. Clone the project

```
git clone https://github.com/Sobaka-Pavlova/MERNKanban
cd MERNKanban/server
```

1. Create `.env` file in server folder

- `example.env` provides exact structure for your `.env` file. Make sure to create a secure secret key and replace mongo connection string with a valid one provided in `Connect` section of your mongo cluster.

2. Run `docker-compose` in the main folder

```
cd ..
.../MERNKanban $ docker-compose up 
```

3. Navigate to [localhost:3000](http://localhost:3000)
   
   - To enable Hot Reload on Windows try uncommenting `CHOKIDAR_USEPOLLING=true` in `docker-compose.yml` 

## Production


0. Clone the project

```
git clone https://github.com/Sobaka-Pavlova/MERNKanban
cd MERNKanban/server
```

1. Create `.env` file in server folder

- `example.env` provides exact structure for your `.env` file. Make sure to create a secure secret key and replace mongo connection string with a valid one provided in `Connect` section of your mongo cluster.

2. Run `docker-compose` in the main folder

```
cd ..
.../MERNKanban$ docker-compose -f docker-compose.prod.yml up 
```

3. Navigate to your website

- Note that you might require custom firewall configuration
- If you run into issues: 
  - run `docker ps -a` to confirm that all containers are up 
  - Check NGINX logs in the frontend container:
    - Use `docker exec -it MERNKanban_frontend_1` to drop into the container
    - Navigate to `/var/log/nginx` for access and error logs