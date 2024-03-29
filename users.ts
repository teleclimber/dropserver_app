/**
 * User represents an appspace user.
 */
export interface User {
	/**
	 * proxyID is the unique string key that identifies the user in an appspace.
	 */
	proxyId: string,
	/**
	 * permissions that this user has in addition to basic access.
	 */
	//permissions: string[],	// not yet really implemented
	/**
	 * Display name to use for the user.
	 */
	displayName: string
	/**
	 * filename of the avatar for the user
	 */
	avatar: string
}
