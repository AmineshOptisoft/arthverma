function successResponse (data, statusCode = 200) {
  return {
    success: true,
    data: data
  }
}

function errorResponse (message, statusCode = 400) {
  return {
    success: false,
    error: message
  }
}

function standardizeProjectResponse (project) {
  return {
    projectId: project.projectId,
    projectName: project.projectName,
    year: project.year,
    currency: project.currency,
    initialBudgetLocal: project.initialBudgetLocal,
    budgetUsd: project.budgetUsd,
    initialScheduleEstimateMonths: project.initialScheduleEstimateMonths,
    adjustedScheduleEstimateMonths: project.adjustedScheduleEstimateMonths,
    contingencyRate: project.contingencyRate,
    escalationRate: project.escalationRate,
    finalBudgetUsd: project.finalBudgetUsd
  }
}

module.exports = {
  successResponse,
  errorResponse,
  standardizeProjectResponse
} 