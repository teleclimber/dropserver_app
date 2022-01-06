/**
 * MigrationFunction is the signature of a function used to 
 * migrate appspace data from one schema to the next or previous.
 */
export type MigrationFunction = () => Promise<void>;

/**
 * Describe a Migration step.
 */
export type Migration = {
	/**
	 * direction of migration. "up" means migrating to the next schema,
	 * while "down" is the opposite.
	 */
	direction: "up"|"down",
	/**
	 * Schema is an integer representing the version of the data directoriy of the appspace.
	 * - If direction is "up", schema is the version reached after the migration finishes.
	 * - If the direction is down, schema is the version before the migration starts.
	 * 
	 * Put another way: for a given schema number, "down" reverses the changes mde by "up".
	 */
	schema: number,
	/**
	 * The migration function. See MigrationFunction signature.
	 */
	func: MigrationFunction
}

/**
 * Migrations is the set of migrations that the app supports.
 */
export type Migrations = Migration[];

/**
 * MigrationBuilder helps you create a Migrations Object.
 */
export default class MigrationsBuilder {
	migrations : Migrations = [];

	/**
	 * Add an "up" migration.
	 * @param schema is an integer that represents the version of the data directory
	 * after the migration function has run.
	 * @param func is the migration function.
	 */
	upTo(schema:number, func:MigrationFunction) :void {
		schema = Math.round(schema);	// probably need more checks against schema.
		this.migrations.push({
			direction: "up",
			schema,
			func
		});
	}
	/**
	 * Add a "down" migration.
	 * @param schema is an integer that represents the version of the data directory 
	 * prior to running the migration function.
	 * @param func is the migration function.
	 */
	downFrom(schema:number, func:MigrationFunction) :void {
		schema = Math.round(schema);
		this.migrations.push({
			direction: "down",
			schema,
			func
		});
	}
	// we'll need a check function to ensure migrations are consistent
}