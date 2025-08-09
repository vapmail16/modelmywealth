const projectService = require('../services/projectService');
const { asyncHandler, NotFoundError } = require('../middleware/errorHandler');

class ProjectController {
  getUserProjects = asyncHandler(async (req, res) => {
    const { company_id } = req.query;
    const projects = await projectService.getUserProjects(req.user.id, company_id);

    res.json({
      success: true,
      data: projects
    });
  });

  getProjectById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const project = await projectService.getProjectById(id, req.user.id);

    res.json({
      success: true,
      data: project
    });
  });

  createProject = asyncHandler(async (req, res) => {
    const projectData = req.body;
    const project = await projectService.createProject(projectData, req.user.id);

    res.status(201).json({
      success: true,
      data: project
    });
  });

  updateProject = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const projectData = req.body;
    const project = await projectService.updateProject(id, projectData, req.user.id);

    res.json({
      success: true,
      data: project
    });
  });

  deleteProject = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await projectService.deleteProject(id, req.user.id);

    res.json({
      success: true,
      data: {
        message: "Project deleted successfully"
      }
    });
  });

  getProjectData = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = await projectService.getProjectData(id, req.user.id);

    res.json({
      success: true,
      data
    });
  });

  updateProjectData = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const updatedData = await projectService.updateProjectData(id, req.user.id, data);

    res.json({
      success: true,
      data: updatedData
    });
  });
}

module.exports = new ProjectController(); 