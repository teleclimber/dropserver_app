/**
 * function used to migrate appspace data from one schema
 * to the next or previous.
 */
export type MigrationFunction = () => Promise<void>;

/**
 * Describe a Migration step.
 */
export type Migration = {
	// TODO figure out how to document type alias object props
	/**
	 * Direction of migration. "up" means migrating to the next schema,
	 * while "down" is the opposite.
	 */
	direction: "up"|"down",
	/**
	 * Schema is an integer representing the version of the data directory of the appspace.
	 * - If direction is "up", schema is the version reached after the migration finishes.
	 * - If the direction is down, schema is the version before the migration starts.
	 * 
	 * Put another way: for a given schema number, "down" reverses the changes made by "up".
	 */
	schema: number,
	/**
	 * The migration function.
	 */
	func: MigrationFunction
}

/**
 * Migrations is the set of migrations that the app supports.
 */
export type Migrations = Migration[];

/**
 * Class that helps create a Migrations object.
 */
export default class MigrationsBuilder {
	migrations : Migrations = [];

	/**
	 * Add an "up" migration.
	 * @param schema (integer) schema version of the data directory
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
	 * @param schema (integer) schema version of the data directory 
	 * prior to running the migration function
	 * @param func migration function
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