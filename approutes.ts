import type {
	AppRoute as AppRouteInternal,
	Context as ContextInternal,
	Handler as HandlerInternal
} from 'https://deno.land/x/dropserver_lib_support@v0.2.0/mod.ts';

/**
 * Context is passed to request handlers.
 */
export interface Context {
	/** request is the raw request. Note that the url is incorrect (?) */
	request: Request
	/** respondWith sends a response to the request */
	respondWith(r: Response | Promise<Response>): Promise<void>
	/** params are values of parametrized url paths for this request */
	params: Record<string, unknown>
	/** url that was actually requested (?)  */
	url: URL
	/** proxyId of the authenticated user who made the request, if any. */
	proxyId: string | null
}

/** HTTP request handler function */
export type Handler = (ctx:Context) => void;

/** Authorization categories */
export enum AuthAllow {
	/** 
	 * "authorized" means the user must be authenticated
	 * and added to the appspace by appspace owner 
	 */
	authorized = "authorized",
	/**
	 * "public" means there is no authentication or authorization required
	 * to access route
	 */
	public = "public"
}

/**
 * Auth object describes the authorization requirements
 * to access the route.
 */
export type Auth = {
	/**
	 * The authorization category
	 */
	allow: AuthAllow,
	/*
	 * Additional permission required to access route.
	 * For "authorized" categories only.
	 */
	// permission?: string	//not implemented fully. Add when it is.
}

/**
 * Describes the path that the request must match to execute this route
 */
export type Path = {
	/**
	 * The path string. 
	 * Supports parameters like /widget/:id
	 */
	path: string,
	/**
	 * - end is true: the request path must end where the route path ends.
	 * - end is false: the requst path can be longer than the route path, 
	 * which could be thought of as adding a wildcard to the end 
	 * of the route path like /widget/:id/*
	 * 
	 * Default: true
	 */
	end: boolean
}

/**
 * Options to pass to the static file handler
 */
export type StaticOpts = {
	/** The path to the file or directory to serve.
	 * Use the following prefixes:
	 * - @app/ refers to the application root directory
	 * - @appspace/ refers to the appspace files directory
	 * - @avatars/ refers to the directory where user avatars are stored.
	 * 
	 * Example: @app/frontend/index.html 
	 */
	path: string
}

type AppRouteBase = {
	/** "get", "post", etc... */
	method: string,	// make that an enum or specific set of strings
	/** The path to match for this route. See Path struct. */
	path: Path,
	/** The authorization requirements. See Auth struct. */
	auth: Auth,
}

/** 
 * RouteType indicates whether the handler runs in sandbox
 * or is a static file serve, which is handled by Dropserver.
 */
export enum RouteType {
	/**
	 * "function" means a sandbox will be started if necessary and 
	 * function called to handle the request
	 */
	function = "function",
	/**
	 * "static" route types are handled entirely on the Dropserver host
	 * leaving the sandbox off and saving resources.
	 */
	static = "static"
}

export type StaticAppRoute = AppRouteBase & {
	type: RouteType.static
	/** Static route options. See StaticOpts struct. */
	opts: StaticOpts
}
export type FunctionAppRoute = AppRouteBase & {
	type: RouteType.function
	/** Route handler function. See Handler signature. */
	handler: Handler
}

export type AppRoute = StaticAppRoute|FunctionAppRoute

/**
 * RoutesBuilder is a convenience class that helps you create
 * application routes for the createApp function using a 
 * a familiar pattern. 
 */
export class RoutesBuilder {
	routes: AppRouteInternal[] = [];
	#static_handlers: Map<Handler,StaticOpts> = new Map();

	/**
	 * Add a route handler
	 * @param method "get", "post", etc...
	 * @param path can be string like "/create/" or Path object
	 * @param auth specifies the required authorization for this route
	 * @param handler the route handler
	 */
	add(method:string, path:string|Path, auth:Auth, handler:Handler) {
		if( typeof path === 'string' ) path = {path:path, end:true};
		if( this.#static_handlers.has(handler) ) {
			this.routes.push({
				type: RouteType.static,
				auth,
				method,
				path,
				opts:this.#static_handlers.get(handler)!
			});
		}
		else {
			this.routes.push({
				type:RouteType.function, 
				auth,
				method,
				path,
				handler: getHandler(handler),
				handlerName: handler.name
			});
		}
	}
	/**
	 * Create a static file handler with the passed options.
	 * Static file handlers created this way are handled by the Dropserver host
	 * and do not require a running sandbox, saving resources.
	 * @param opts see StaticOpts struct.
	 * @returns a handler used to create route.
	 */
	staticFileHandler(opts:StaticOpts) :Handler {
		const h = function() {};
		this.#static_handlers.set(h, opts);
		return h;
	}
}

function getHandler(h :Handler) :HandlerInternal {
	return function(ctx :ContextInternal) {
		const c :Context = {
			request: ctx.req.request,
			respondWith: ctx.req.respondWith, 
			// TODO: respondJSON, respondHTML, respondStatus
			params: ctx.params,
			url: ctx.url,
			proxyId: ctx.proxyId
		};
		h(c);
	}
}

