# Vratix API Module Library
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)
![GitHub License](https://img.shields.io/github/license/vratix-dev/api-library)

## Overview 
Easy-to-use, open-source modules that implement common API logic for seamless integration into Node.js APIs.

We created this library of reusable API modules to streamline API development. As backend developers, we often found ourselves doing repetitive work or copying outdated code from old projects and inconsistent online sources.

This led us to build a high-quality repository of reusable API modules that address common functionality used in every backend service. 
In the age of AI code assistants, these modules remain reliably crafted by developers, following best practices with minimal assumptions. 
This makes it easy for any developer to integrate these modules into any API project with flexibility.

Currently, the modules support **Express.js**, and we’re actively working to extend compatibility with other backend languages and popular Node.js frameworks.

> **NOTE:** This isn’t just another package; it’s a source code repository you can copy and use — your code, your way. These modules are designed to serve as a solid foundation for API development, so feel free to adapt them to fit your unique needs.

**We recommend using our CLI** to import modules into your codebase. The CLI automates file placement, manages external dependencies, sets up database repositories, and resolves module imports.

Stop reinventing the wheel. Start innovating where it counts.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Modules Documentation](#modules)
  - [Auth Basic](./registry/modules/authBasic/README.mdx)
  - [Stripe Subscriptions](./registry/modules/stripeSubscriptions/README.mdx)
  - [S3 File Upload](./registry/modules/upload-to-s3/README.mdx)
- [Configuration](./docs/config.mdx)
- [The CLI](./docs/cli.mdx)
- [License](LICENSE)

## Installation

You’re free to copy and use any code from this API Module Library — it's designed to be a foundation you can build on.

To simplify setup and integration, we created a CLI tool that helps you start new projects or integrate our API Modules into existing ones. 
The CLI handles imports, configurations, and dependencies automatically, so you can get up and running in minutes.

### Start a New Project

Use the `init` command to create a new Node.js project or configure an existing one. 
Add the `-c` flag to specify a custom folder, or the CLI will set up the project in the current directory:

```bash
npx vratix init
```

### Configure Your Project

The CLI will prompt you with a few questions to configure your project and create `./config/modules.json`:

```txt showLineNumbers
Select your package manager: › pnpm
What database are you going to use: › PostgreSQL
Select your schema validator: › zod
Should we set up Docker containers for this service (docker-compose.yaml): › no / yes 
Should we configure a web proxy for this project (NGINX): › no / yes
```

### Choose API Modules

During setup, select any initial API Modules you’d like to install as part of the project template:

```txt showLineNumbers
☐ Auth (Basic)
☐ Stripe Subscriptions
☐ S3 File Upload
☐ None
```

If you choose "None," you can add modules individually after setup.

### Set Folder Overrides

Customize the paths for main module folders if needed:

```txt showLineNumbers
@components -> /src/components
@routes -> /src/routes
@middleware -> /src/middleware
@utils -> /src/utils
```

> **Note**: Any folder overrides will still be located within `/src`.

### Ready To Go

Once setup is complete, run:

```bash
npm run dev
```

to start your service.

To add additional modules later, simply use:

```bash
npx vratix add auth-basic
```