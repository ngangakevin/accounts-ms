<div align="center" id="top"> 
  <img src="./.github/app.gif" alt="{{Accounts MS}}" />

  &#xa0;

  <!-- <a href="https://{{app_url}}.netlify.app">Demo</a> -->
</div>

<h1 align="center">{{Accounts MS}}</h1>

<p align="center">
  <img alt="Github top language" src="https://img.shields.io/github/languages/top/{{github}}/{{repository}}?color=56BEB8">
  <img alt="Github language count" src="https://img.shields.io/github/languages/count/{{github}}/{{repository}}?color=56BEB8">
  <img alt="Repository size" src="https://img.shields.io/github/repo-size/{{github}}/{{repository}}?color=56BEB8">
  <img alt="License" src="https://img.shields.io/github/license/{{github}}/{{repository}}?color=56BEB8">
  <!-- <img alt="Github issues" src="https://img.shields.io/github/issues/{{github}}/{{repository}}?color=56BEB8" /> -->
  <!-- <img alt="Github forks" src="https://img.shields.io/github/forks/{{github}}/{{repository}}?color=56BEB8" /> -->
  <!-- <img alt="Github stars" src="https://img.shields.io/github/stars/{{github}}/{{repository}}?color=56BEB8" /> -->
</p>

<!-- Status -->

<!-- <h4 align="center"> 
	🚧  {{app_name}} 🚀 Under construction...  🚧
</h4> 

<hr> -->

<p align="center">
  <a href="#dart-about">About</a> &#xa0; | &#xa0; 
  <a href="#sparkles-features">Features</a> &#xa0; | &#xa0;
  <a href="#rocket-technologies">Technologies</a> &#xa0; | &#xa0;
  <a href="#white_check_mark-requirements">Requirements</a> &#xa0; | &#xa0;
  <a href="#checkered_flag-starting">Starting</a> &#xa0; | &#xa0;
  <a href="#memo-license">License</a> &#xa0; | &#xa0;
  <a href="https://github.com/{{github}}" target="_blank">Author</a>
</p>

<br>

## :dart: About ##

As part of Quickbank, the accounts microservice is responsible for operations within entities holding funds. The service can be accessed via Rest, or via microservice events and messages.

## :sparkles: Features ##

:heavy_check_mark: Opening accounts;\
:heavy_check_mark: Search accounts;\
:heavy_check_mark: Deposit to account;
:heavy_check_mark: Account to Account transfer;
:heavy_check_mark: Account termination;
:heavy_check_mark: Account freeze;
:heavy_check_mark: Account charge remitance;
## :rocket: Technologies ##

The following tools were used in this project:

- [Docker](https://www.docker.com)
- [Nest.js](https://nestjs.com)
- [Redis](https://redis.io)
- [Postgres](https://www.postgresql.org)
- [TypeScript](https://www.typescriptlang.org/)
- [Swagger - OpenAPI](https://swagger.io)

## :white_check_mark: Requirements ##

Before starting :checkered_flag:, you need to have [Git](https://git-scm.com), [Docker](https://www.docker.com), [Redis](https://redis.io), [TypeScript](https://www.typescriptlang.org/) and [Nest.js](https://nestjs.com) installed. You will need a running instance of [Postgres](https://www.postgresql.org) database. Set environment variables to a file in the **env** directory, named under the desired environment setup. For instace, development.env for development environment. Note that you can only run one environment at a time, since the accounts service is set to run on port 3040.

## :checkered_flag: Starting ##

```bash
# Clone this project
$ git clone https://github.com/{{github}}/{{repository}}

# Access
$ cd {{repository}}

# build docker image for development
$ docker-compose build dev

#OR

# build docker image for production
$ docker-compose build prod

# run docker image for development
$ docker-compose up dev

#OR

# run docker image for production
$ docker-compose run prod

# Run the project
$ docker-compose up 

# The server will initialize in the <http://localhost:3000>
```

## :memo: License ##

This project is under license from MIT. For more details, see the [LICENSE](LICENSE) file.


Made with :heart: by <a href="https://github.com/{{github}}" target="_blank">{{Nganga kingori}}</a>

&#xa0;

<a href="#top">Back to top</a>