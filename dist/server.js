
        import { createRequire } from 'module';
        const require = createRequire(import.meta.url);
        

// src/app.ts
import express from "express";

// src/modules/auth/auth.route.ts
import Router from "express";

// src/utilities/SendResponse.ts
var SendResponse = (res, statusCode, success, message, data, error) => {
  res.status(statusCode).json({
    success,
    message,
    data,
    error
  });
};
var SendResponse_default = SendResponse;

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
var config = {
  port: process.env.PORT,
  connectionString: process.env.DB_CONNECTIONSTRING,
  jwt_secret: process.env.JWT_SECRET
};
var config_default = config;

// src/database/index.db.ts
import { Pool } from "pg";
var pool = new Pool({
  connectionString: config_default.connectionString
});
var initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'contributor'
        CHECK(role IN('contributor','maintainer')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS issues(
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL
    CHECK(LENGTH(description) >= 20),
    type VARCHAR(20) NOT NULL
    CHECK(type IN('bug', 'feature_request')),
    status VARCHAR(20) DEFAULT 'open'
    CHECK(status IN('open', 'in_progress', 'resolved')),
    reporter_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
  console.log(`\u{1F6E9}\uFE0F  Database connected successfully!`);
};
var index_db_default = initDB;

// src/modules/auth/auth.service.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
var signupIntoDB = async (signupData) => {
  const { name, email, password, role } = signupData;
  const hashPassword = await bcrypt.hash(password, 12);
  const result = pool.query(`
    INSERT INTO users(name,email,password,role) VALUES ($1,$2,$3,COALESCE($4, 'contributor'))
    RETURNING *`, [name, email, hashPassword, role]);
  return result;
};
var loginIntoDB = async (loginData) => {
  const { email, password } = loginData;
  const isUserExist = await pool.query(`
    SELECT * FROM users WHERE email = $1
    `, [email]);
  if (isUserExist.rows.length === 0) {
    throw new Error("Invalid credentials!");
  }
  const user = isUserExist.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid credentials!");
  }
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accessToken = await jwt.sign(payload, config_default.jwt_secret, { expiresIn: "1d" });
  delete user.password;
  return {
    token: accessToken,
    user
  };
};
var authService = {
  signupIntoDB,
  loginIntoDB
};

// src/modules/auth/auth.controller.ts
var signup = async (req, res) => {
  try {
    const signupData = req.body;
    const result = await authService.signupIntoDB(signupData);
    if (result.rows.length === 0) {
      return SendResponse_default(res, 400, false, "User registration failed");
    }
    delete result.rows[0].password;
    return SendResponse_default(res, 201, true, "User registered successfully", result.rows[0]);
  } catch (error) {
    return SendResponse_default(res, 500, false, error.message, error);
  }
};
var login = async (req, res) => {
  try {
    const loginData = req.body;
    const result = await authService.loginIntoDB(loginData);
    return SendResponse_default(res, 200, true, "Login successful", result);
  } catch (error) {
    return SendResponse_default(res, 500, false, error.message, error);
  }
};
var authController = {
  signup,
  login
};

// src/modules/auth/auth.route.ts
var router = Router();
router.post("/signup", authController.signup);
router.post("/login", authController.login);
var authRouter = router;

// src/modules/issues/issues.route.ts
import Router2 from "express";

// src/modules/issues/issues.service.ts
import jwt2 from "jsonwebtoken";

// src/types/user.type.ts
var UserRole = {
  contributor: "contributor",
  maintainer: "maintainer"
};

// src/modules/issues/issues.service.ts
var createIssueIntoDB = async (issueData, token) => {
  const { title, description, type } = issueData;
  if (!token) {
    throw new Error("Unauthorized access!");
  }
  const decoded = await jwt2.verify(token, config_default.jwt_secret);
  if (!decoded) {
    throw new Error("Unauthorized!!");
  }
  const reporter_id = decoded.id;
  const result = pool.query(`
    INSERT INTO issues(title,description,type,reporter_id) VALUES ($1,$2,$3,$4)
    RETURNING *`, [title, description, type, reporter_id]);
  return result;
};
var getAllIssues = async ({ sort, type, status }) => {
  let query = "SELECT * FROM issues WHERE 1=1 ";
  const values = [];
  if (type) {
    values.push(type);
    query += ` AND type = $${values.length}`;
  }
  if (status) {
    values.push(status);
    query += ` AND status = $${values.length}`;
  }
  const orderBy = sort === "oldest" ? "ASC" : "DESC";
  query += ` ORDER BY created_at ${orderBy}`;
  const issuesResult = await pool.query(query, values);
  const allIssues = issuesResult.rows;
  const reporterIDs = allIssues.map((issue) => issue.reporter_id);
  const reporters = await pool.query(`
    SELECT id, name, role FROM users WHERE id = ANY($1) 
    `, [reporterIDs]);
  const reporterMap = /* @__PURE__ */ new Map();
  reporters.rows.forEach((reporter) => {
    reporterMap.set(reporter.id, reporter);
  });
  const formattedIssue = allIssues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: reporterMap.get(issue.reporter_id),
    created_at: issue.created_at,
    updated_at: issue.updated_at
  }));
  return formattedIssue;
};
var getSingleIssue = async (id) => {
  const result = await pool.query(`
    SELECT * FROM issues WHERE id = $1
    `, [id]);
  if (result.rows.length === 0) {
    throw new Error("Issue not found");
  }
  delete result.rows[0].password;
  const issue = result.rows[0];
  const reporterID = issue.reporter_id;
  const reporter = await pool.query(`
    SELECT id, name, role FROM users WHERE id = $1
    `, [reporterID]);
  const reporterMap = /* @__PURE__ */ new Map();
  reporter.rows.forEach((reporter2) => {
    reporterMap.set(reporter2.id, reporter2);
  });
  const formattedIssue = {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: reporterMap.get(issue.reporter_id),
    created_at: issue.created_at,
    updated_at: issue.updated_at
  };
  return formattedIssue;
};
var updateIssue = async (payload, user, id) => {
  const { title, description, type, status = "in_progress" } = payload;
  const issue = await getSingleIssue(id);
  if (issue.status !== "open") {
    throw new Error("Issues is already Updated.");
  }
  const updated_at = /* @__PURE__ */ new Date();
  if (user.role === UserRole.maintainer) {
    const result2 = await pool.query(`
        UPDATE issues SET title = COALESCE($1,title), description = COALESCE($2, description), type = COALESCE($3, type), status = COALESCE($4, status), 
        updated_at = COALESCE($5,updated_at) WHERE id = $6 RETURNING *`, [title, description, type, status, updated_at, id]);
    return result2;
  }
  if (user.id !== issue.reporter.id) {
    throw new Error(`Unauthorized! Does not have permission!`);
  }
  const result = await pool.query(`
    UPDATE issues SET title = COALESCE($1,title), description = COALESCE($2, description), type = COALESCE($3, type), status = COALESCE($4, status), 
    updated_at = COALESCE($5,updated_at) WHERE id = $6 RETURNING *`, [title, description, type, status, updated_at, id]);
  return result;
};
var deleteIssue = async (id) => {
  console.log("ID: ", id);
  const issue = await pool.query(`
    SELECT * FROM issues WHERE id = $1
    `, [id]);
  console.log("Issues: ", issue);
  if (issue.rows.length === 0) {
    throw new Error("Issue not found!");
  }
  const result = await pool.query(`
    DELETE FROM issues WHERE id = $1
    `, [id]);
  ;
  return result;
};
var issuesService = {
  createIssueIntoDB,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/modules/issues/issues.controller.ts
var createIssue = async (req, res) => {
  try {
    const issueData = req.body;
    const authorization = req.headers?.authorization;
    const result = await issuesService.createIssueIntoDB(issueData, authorization);
    if (result.rows.length === 0) {
      return SendResponse_default(res, 400, false, "Issue creation failed");
    }
    return SendResponse_default(res, 201, true, "Issue created successfully", result.rows[0]);
  } catch (error) {
    return SendResponse_default(res, 500, false, error.message, error);
  }
};
var getAllIssues2 = async (req, res) => {
  try {
    const { sort, type, status } = req.query;
    const allowedSort = ["newest", "oldest"];
    const allowedType = ["bug", "feature_request"];
    const allowedStatus = ["open", "in_progress", "resolved"];
    const sortQuery = allowedSort.includes(sort) ? sort : allowedSort[0];
    const typeQuery = allowedType.includes(type) ? type : void 0;
    const statusQuery = allowedStatus.includes(status) ? status : void 0;
    const query = {
      sort: sortQuery,
      type: typeQuery,
      status: statusQuery
    };
    const result = await issuesService.getAllIssues(query);
    if (result.length === 0) {
      return SendResponse_default(
        res,
        200,
        true,
        "No issues found",
        []
      );
    }
    return SendResponse_default(
      res,
      200,
      true,
      "Issues retrieved successfully",
      result
    );
  } catch (error) {
    return SendResponse_default(res, 500, error.message, error);
  }
};
var getSingleIssue2 = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await issuesService.getSingleIssue(id);
    if (!result) {
      return SendResponse_default(res, 404, false, "Issue not found");
    }
    return SendResponse_default(res, 200, true, "Issue retrived successfully", result);
  } catch (error) {
    return SendResponse_default(res, 500, false, error.message, error);
  }
};
var updateIssue2 = async (req, res) => {
  try {
    const user = req.user;
    const updatedIssueData = req.body;
    const { id } = req.params;
    const result = await issuesService.updateIssue(updatedIssueData, user, id);
    if (result.rows.length === 0) {
      return SendResponse_default(res, 400, false, "Issue update failed");
    }
    return SendResponse_default(res, 200, true, "Issue updated successfully", result.rows[0]);
  } catch (error) {
    return SendResponse_default(res, 500, false, error.message, error);
  }
};
var deleteIssue2 = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await issuesService.deleteIssue(id);
    console.log("Controller Delete: ", result);
    if (result.rowCount !== 1) {
      return SendResponse_default(res, 404, false, "Issue not found");
    }
    return SendResponse_default(res, 200, true, "Issue deleted successfully");
  } catch (error) {
    return SendResponse_default(res, 500, false, error.message, error);
  }
};
var issuesController = {
  createIssue,
  getAllIssues: getAllIssues2,
  getSingleIssue: getSingleIssue2,
  updateIssue: updateIssue2,
  deleteIssue: deleteIssue2
};

// src/middleware/auth.middleware.ts
import jwt3 from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return SendResponse_default(res, 401, false, "Unauthorized access!");
      }
      const decoded = await jwt3.verify(token, config_default.jwt_secret);
      const verifyUser = await pool.query(`
        SELECT * FROM users WHERE email = $1
        `, [decoded.email]);
      const user = verifyUser.rows[0];
      if (!user) {
        return SendResponse_default(res, 404, false, "User not found!");
      }
      req.user = decoded;
      if (roles.length && !roles.includes(user.role)) {
        return SendResponse_default(res, 403, false, "Forbidden!!");
      }
      next();
    } catch (error) {
      SendResponse_default(res, 401, false, error.message, error);
    }
  };
};
var auth_middleware_default = auth;

// src/modules/issues/issues.route.ts
var router2 = Router2();
router2.post("/", auth_middleware_default(UserRole.contributor, UserRole.maintainer), issuesController.createIssue);
router2.get("/", issuesController.getAllIssues);
router2.get("/:id", issuesController.getSingleIssue);
router2.patch("/:id", auth_middleware_default(UserRole.contributor, UserRole.maintainer), issuesController.updateIssue);
router2.delete("/:id", auth_middleware_default(UserRole.maintainer), issuesController.deleteIssue);
var issuesRouter = router2;

// src/app.ts
var app = express();
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/issues", issuesRouter);
app.get("/", (req, res) => {
  res.send("This is the root of Devpulse");
});

// src/server.ts
var main = () => {
  index_db_default();
  app.listen(config_default.port, () => {
    console.log(`\u{1F525} The server is running on port: ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map