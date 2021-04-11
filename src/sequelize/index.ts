import { Sequelize } from 'sequelize';
import { userTable } from './models/user';
import { todoTable } from './models/todo';
import { scheduleTable } from './models/schedule';
import { planTable } from './models/plan';
import { pageTable } from './models/page';
import { memoTable } from './models/memo';
import { groupTable } from './models/group';
import { mediaTable } from './models/media';

console.log("mysql database connecting..");

const { DB = "database", ROOT = "root", PASS = "pass", HOST = "localhost", DB_FORCE = "false", pm_id, NODE_ENV = "development" } = process.env;

let sequelize: Sequelize;

try {
	sequelize = new Sequelize(
    DB, 
    ROOT, 
    PASS, 
    {
      host : HOST,
      dialect: 'mysql',
      define: {
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci"
		  }
	  }
  );

	const modelDefiners: any = [
		userTable,
		todoTable,
		scheduleTable,
		planTable,
		pageTable,
		memoTable,
		groupTable,
		mediaTable
	];
	
	for (const modelDefiner of modelDefiners) {
		modelDefiner(sequelize);
	}

	const { user, todo, schedule, plan, page, memo, group, media } = sequelize.models;

	user.hasMany(todo);
	user.hasMany(plan);
	user.hasMany(memo);
	user.hasMany(group);
	plan.hasMany(schedule);
	group.hasMany(page);
	page.hasMany(media);

	todo.belongsTo(user);
	plan.belongsTo(user);
	memo.belongsTo(user);
	group.belongsTo(user);
	schedule.belongsTo(plan);
	page.belongsTo(group);
	media.belongsTo(page);

	// DB Force Init.
	let pmInit = false;
	if(NODE_ENV === "production") {
		if(pm_id === "0") {
			pmInit = true;
		} else {
			pmInit = false;
		}
	} else {
		pmInit = true;
	}

	const force = DB_FORCE === "true" ? true : false;
	
  // DB Sync.
	if(force && pmInit) {
		sequelize.sync({ force });
	} else {
		sequelize.sync();
	}

	console.log("mysql database connect success !");
} catch(err) {
	console.log("mysql database connect error:", err);
	process.exit(1);
}

export default sequelize;