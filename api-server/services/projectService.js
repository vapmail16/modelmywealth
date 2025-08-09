const projectRepository = require('../repositories/projectRepository');

class ProjectService {
  async getUserProjects(userId, companyId = null) {
    return await projectRepository.getUserProjects(userId, companyId);
  }

  async getProjectById(projectId, userId) {
    const project = await projectRepository.getProjectById(projectId, userId);
    if (!project) {
      throw new Error('Project not found');
    }
    return project;
  }

  async createProject(projectData, userId) {
    if (!projectData.name) {
      throw new Error('Project name is required');
    }

    return await projectRepository.createProject(projectData, userId);
  }

  async updateProject(projectId, projectData, userId) {
    if (!projectData.name) {
      throw new Error('Project name is required');
    }

    const project = await projectRepository.updateProject(projectId, projectData, userId);
    if (!project) {
      throw new Error('Project not found');
    }
    return project;
  }

  async deleteProject(projectId, userId) {
    const project = await projectRepository.deleteProject(projectId, userId);
    if (!project) {
      throw new Error('Project not found');
    }
    return project;
  }

  async getProjectData(projectId, userId) {
    const data = await projectRepository.getProjectData(projectId, userId);
    if (!data) {
      throw new Error('Project not found');
    }
    return data;
  }

  async updateProjectData(projectId, userId, data) {
    const updatedData = await projectRepository.updateProjectData(projectId, userId, data);
    if (!updatedData) {
      throw new Error('Project not found');
    }
    return updatedData;
  }
}

module.exports = new ProjectService(); 