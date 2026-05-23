import Router from "express";
import { issuesController } from "./issues.controller";
import auth from "../../middleware/auth.middleware";
import { UserRole } from "../../types/user.type";

const router = Router();

router.post('/',auth(UserRole.contributor,UserRole.maintainer),issuesController.createIssue);
router.get('/',issuesController.getAllIssues)
export const issuesRouter = router;