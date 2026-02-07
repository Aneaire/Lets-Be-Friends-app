/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as bookings from "../bookings.js";
import type * as comments from "../comments.js";
import type * as follows from "../follows.js";
import type * as http from "../http.js";
import type * as locations from "../locations.js";
import type * as messages from "../messages.js";
import type * as migrations from "../migrations.js";
import type * as notifications from "../notifications.js";
import type * as onboarding from "../onboarding.js";
import type * as paymongo from "../paymongo.js";
import type * as posts from "../posts.js";
import type * as reviews from "../reviews.js";
import type * as search from "../search.js";
import type * as services from "../services.js";
import type * as storage from "../storage.js";
import type * as storageDirect from "../storageDirect.js";
import type * as test from "../test.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  bookings: typeof bookings;
  comments: typeof comments;
  follows: typeof follows;
  http: typeof http;
  locations: typeof locations;
  messages: typeof messages;
  migrations: typeof migrations;
  notifications: typeof notifications;
  onboarding: typeof onboarding;
  paymongo: typeof paymongo;
  posts: typeof posts;
  reviews: typeof reviews;
  search: typeof search;
  services: typeof services;
  storage: typeof storage;
  storageDirect: typeof storageDirect;
  test: typeof test;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
