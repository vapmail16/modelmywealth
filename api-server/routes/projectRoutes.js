const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticateUser } = require('../middleware/auth');

// All project routes require authentication
router.use(authenticateUser);

router.get('/', projectController.getUserProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', projectController.createProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);
router.get('/:id/data', projectController.getProjectData);
router.put('/:id/data', projectController.updateProjectData);

module.exports = router; 