import * as path from "https://deno.land/std@0.106.0/path/mod.ts";

import type {User} from './users.ts';

import type {AppRoutes} from'./approutes.ts';
import type {Migrations} from './migrations.ts';

import mustGetLibSupport from './getlibsupport.ts';

/**
 * DropserverApp 
 */
export class DropserverApp {
	/**
	 * appPath is the path to the app directory for this particular run of the sandbox.
	 * It may change at any time. Do not store it, instead always call this function.
	 * @param p a path segment to append to the app path.
	 * @returns a path that joins the app path to the passed path segment.
	 */
	appPath(p:string) :string {
		// path functions should take a sequence of args, and apply path.join over all of them.
		const internal = mustGetLibSupport();
		return path.join(internal.appPath, p);
	}
	/**
	 * appspacePath is the path to the appspace data directory for this particular run of the sandbox.
	 * It may change at any time. Do not store it, instead always call this function.
	 * @param p a path segment to append to the appspace path.
	 * @returns a path that joins the appspace path to the passed path segment.
	 */
	appspacePath(p:string) :string {
		const internal = mustGetLibSupport();
		return path.join(internal.appspacePath, p);
	}
	/**
	 * avatarsPath is the path to the directory where user avatars are stored.
	 * It may change at any time. Do not store it, instead always call this function.
	 * @param p a path segment to append to the app path.
	 * @returns a path that joins the app path to the passed path segment.
	 */
	avatarsPath(p:string) :string {
		return path.join(mustGetLibSupport().avatarsPath, p);
	}

	/**
	 * Get all users for this appspace.
	 * @returns an array of Users.
	 */
	async getUsers() :Promise<User[]> {
		const l = mustGetLibSupport();
		return await l.users.getAll();
	}
	/**
	 * Get a single user of this appspace.
	 * @param proxyId of the user you wish to retrieve.
	 * @returns the User.
	 */
	async getUser(proxyId:string) :Promise<User> {
		const l = mustGetLibSupport();
		return await l.users.get(proxyId);
	}
}

interface DropserverAppI {
	appPath(p:string) :string
	appspacePath(p:string) :string
	avatarsPath(p:string) :string

	getUsers() :Promise<User[]>
	getUser(proxyId:string) :Promise<User>

	//...?
}

type AppRoutesFn = ()=>AppRoutes;

type MigrationsFn = () => Migrations;
type MigrationsPr = () => Promise<Migrations>;

/**
 * AppConfig is what the app code provides to Dropserver 
 * to create an app
 */
interface AppConfig {
	/**
	 * routes are application routes. They do not change.
	 */
	routes : AppRoutes | AppRoutesFn
	/** 
	 * migrations transform the appspace data such that it matches the 
	 * target schema.
	 */
	migrations? :Migrations | MigrationsFn | MigrationsPr
}

/**
 * createApp initializes the application and returns an object that
 * lets the app work with Dropserver.
 * @param config sets everything that needs to be set for the app to work
 * @returns a DropserverAppI interface that should be used by app code to 
 * interact with the Dropserver host.
 */
export default function createApp(config:AppConfig) :DropserverAppI {
	const libSupport = mustGetLibSupport();
	
	// routes:
	let routes :AppRoutesFn|undefined;
	if( typeof config.routes === "function" ) routes = config.routes;
	else if( Array.isArray(config.routes) ) routes = (() => <AppRoutes>config.routes);
	
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