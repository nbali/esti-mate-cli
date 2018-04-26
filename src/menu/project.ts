import inquirer from "inquirer";
import {
  Project,
  wheightedAverageOfTasks,
  confidenceIntervalOfProject
} from "../model";
import { showAddTaskPrompt } from "./add-task";
import { listTasks } from "./list-tasks";
import Table from "cli-table2";
import { listTags } from "./list-tags";
import { saveProjectToFile } from "../service/files";
import { chooseProjectMenu } from "./choose-project";
import { chooseTask } from "./choose-task";
import { addMenuSeparator } from "./utils";

enum ProjectMenuEntry {
  ADD_TASK = "Add task",
  SHOW_PROJECT_SUMMARY = "Show project summary",
  SHOW_TASKS = "Show tasks",
  SHOW_TAGS = "Show Tags",
  MODIFY_TASK = "Modify task",
  SELECT_PROJECT = "Select project"
}

const choices = [
  ProjectMenuEntry.ADD_TASK,
  ProjectMenuEntry.SHOW_PROJECT_SUMMARY,
  ProjectMenuEntry.SHOW_TASKS,
  ProjectMenuEntry.SHOW_TAGS,
  ProjectMenuEntry.MODIFY_TASK,
  ProjectMenuEntry.SELECT_PROJECT
];

const ProjectMenu: inquirer.Question = {
  type: "list",
  name: "selected",
  message: "What to do next?",
  choices
};

const separator = "------------------------------------------";

function displayProjectInfo(project: Project) {
  const interval = confidenceIntervalOfProject(
    project,
    project.defaultInterval
  );
  const table = new Table();
  const entries = [
    { "Short handle:": project.short },
    { "Name:": project.name },
    { "Task count:": project.tasks.length },
    { "Estimation:": wheightedAverageOfTasks(project.tasks).toFixed(2) },
    { "Confidence Interval:": interval.min.toFixed(2) + " - " + interval.max.toFixed(2) }
  ];
  (table as Array<any>).push(...entries);
  console.log(table.toString());
}

function executeOnChoice(
  entry: ProjectMenuEntry,
  answers: any,
  handler: Function
) {
  if (entry === answers.selected) {
    handler();
  }
}

export async function showProjectMenu(project: Project) {
  addMenuSeparator();
  const answer = await inquirer.prompt(ProjectMenu);

  executeOnChoice(ProjectMenuEntry.SHOW_PROJECT_SUMMARY, answer, () => {
    displayProjectInfo(project);
    showProjectMenu(project);
  });
  executeOnChoice(ProjectMenuEntry.ADD_TASK, answer, () =>
    showAddTaskPrompt(project)
  );
  executeOnChoice(ProjectMenuEntry.SHOW_TASKS, answer, () => {
    listTasks(project.tasks);
    showProjectMenu(project);
  });
  executeOnChoice(ProjectMenuEntry.SHOW_TAGS, answer, () => {
    listTags(project);
    showProjectMenu(project);
  });
  executeOnChoice(ProjectMenuEntry.SELECT_PROJECT, answer, () =>
    chooseProjectMenu()
  );
  executeOnChoice(ProjectMenuEntry.MODIFY_TASK, answer, async () => {
    await chooseTask(project);
    showProjectMenu(project);
  });
}
