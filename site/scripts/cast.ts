#!/usr/bin/env vite-node

import { castCommand } from "@galaxy-foundry/cast/command";

import { TDA_CAST_SPEC } from "../src/lib/cast-spec";

await castCommand(process.argv.slice(2), TDA_CAST_SPEC);
