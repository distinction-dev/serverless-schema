# Serverless TS Utils

> Repository containing typescript definitions for Serverless Configuration and Aws Cloudformation resources. and also a collection of utility classes
>
## Install

```bash
npm install @distinction-dev/serverless-schema
```

or

```bash
yarn add @distinction-dev/serverless-schema
```

## Serverless Schema

This repository uses [serverless schema](https://github.com/lalcebo/json-schema) reference as a git submodule since the reference is maintained there, so when you clone this repo, you'll find that the `serverless-reference` folder is empty, so you'll have to manually pull it like so.

```bash
git submodule update --init --recursive
```

## Usage

```ts
import { util1, util2 } from '@distinction-dev/serverless-schema';

```

## Docs
