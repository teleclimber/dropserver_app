import * as path from "https://deno.land/std@0.159.0/path/mod.ts";

export {MigrationsBuilder} from './migrations.ts';
export {RoutesBuilder, AuthAllow} from './approutes.ts';
export type {Context} from './approutes.ts';

import type {User} from './users.ts';

import type {AppRoute as AppRouteInternal} from 'https://deno.land/x/dropserver_lib_support@v0.2.0/mod.ts';
import type {Migrations} from './migrations.ts';

import mustGetLibSupport from './getlibsupport.ts';

/**
 * Class that provides facilites to interact with
 * Dropserver host. 
 */
export class DropserverApp {
	/**
	 * Get an absolute path to app files.
	 * This path may change at any time. Do not store it, instead always call this function.
	 * @param p relative path segment to append to the app path
	 * @returns absolute path
	 */
	appPath(p:string) :string {
		// path functions should take a sequence of args, and apply path.join over all of them.
		const internal = mustGetLibSupport();
		return path.join(internal.appPath, p);
	}
	/**
	 * Get an absolute path to appspace files.
	 * This path may change at any time. Do not store it, instead always call this function.
	 * @param p relative path segment to append to the appspace path
	 * @returns absolute path
	 */
	appspacePath(p:string) :string {
		const internal = mustGetLibSupport();
		return path.join(internal.appspacePath, p);
	}
	/**
	 * Get an absolute path to appspace user avatars.
	 * This path may change at any time. Do not store it, instead always call this function.
	 * @param p relative path segment to append to the avatars path
	 * @returns absolute path
	 */
	avatarsPath(p:string) :string {
		return path.join(mustGetLibSupport().avatarsPath, p);
	}

	/**
	 * Get all users for this appspace.
	 * @returns array of Users
	 */
	async getUsers() :Promise<User[]> {
		const l = mustGetLibSupport();
		return await l.users.getAll();
	}
	/**
	 * Get a single user of this appspace.
	 * @param proxyId the user you wish to retrieve
	 * @returns User
	 */
	async getUser(proxyId:string) :Promise<User> {
		const l = mustGetLibSupport();
		return await l.users.get(proxyId);
	}
}

type AppRoutesFn = ()=>AppRouteInternal[];

type MigrationsFn = () => Migrations;
type MigrationsPr = () => Promise<Migrations>;

/**
 * AppConfig is what the app code provides to Dropserver 
 * to create an app
 */
export interface AppConfig {
	/**
	 * routes are application routes. They do not change.
	 */
	routes : AppRouteInternal[] | AppRoutesFn
	/** 
	 * migrations transform the appspace data such that it matches the 
	 * target schema.
	 */
	migrations? :Migrations | MigrationsFn | MigrationsPr
}

/**
 * Initialize the application
 * @param config sets everything that needs to be set for the app to work
 * @returns a DropserverApp interface that should be used by app code to 
 * interact with the Dropserver host.
 */
export function createApp(config:AppConfig) :DropserverApp {
	const libSupport = mustGetLibSupport();
	
	// routes:
	let routes :AppRoutesFn|undefined;
	if( typeof config.routes === "function" ) routes = config.routes;
	else if( Array.isArray(config.routes) ) routes = (() => <AppRouteInternal[]>config.routes);
	
	if( routes === undefined ) throw new Error("routes is missing or not recognized type");
	libSupport.appRoutes.setCallback(routes);

	// migrations:
	let migrations : MigrationsFn | MigrationsPr | undefined;
	if( typeof config.migrations === "function" ) migrations = config.migrations;
	else if( Array.isArray(config.migrations) ) migrations = () => <Migrations>config.migrations;
	else if( config.migrations !== undefined ) throw new Error("Wrong type for migrations");
	libSupport.migrations.setCallback(migrations);

	return new DropserverApp;
}