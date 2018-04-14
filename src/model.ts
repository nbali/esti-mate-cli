export interface Estimate {
    bestCase: number;
    mostLikely: number;
    worstCase: number;
}

export const wheightedAverageOfEstimate = (e: Estimate) =>
    (e.bestCase + 4 * e.mostLikely + e.worstCase) / 6;

export const standardDeviationOfEstimate = (e: Estimate) =>
    (e.worstCase - e.bestCase) / 6;

export const meanValueOfEstimate = (e: Estimate) =>
    (e.bestCase + e.mostLikely + e.worstCase) / 3;

export const standardErrorOfEstimate = (e: Estimate) =>
    standardDeviationOfEstimate(e) / Math.sqrt(6); // FIXME

export interface Task {
    code: string;
    sequence: number;
    name: string;
    estimate: Estimate;
    tags: string[];
}

export interface Project {
    name: string;
    short: string;
    tasks: Task[];
    defaultInterval: ConfidenceInterval;
}

export const wheightedAverageOfTasks = (tasks: Task[]) =>
    tasks.reduce((acc, task) => acc + wheightedAverageOfEstimate(task.estimate), 0);

export const meanValueOfProject = (p: Project) =>
    p.tasks.reduce((acc, task) => meanValueOfEstimate(task.estimate), 0);

export const standardErrorOTasks = (tasks: Task[]) =>
    Math.sqrt(tasks.reduce((acc, task) => acc + standardErrorOfEstimate(task.estimate) ** 2, 0));

type ConfidenceInterval = 68 | 90 | 95 | 99.7;
export const confidenceIntervals: ConfidenceInterval[] = [68, 90, 95, 99.7];
export const confidenceIntervalCoEfficients = {
    68: 1,
    90: 1.645,
    95: 2,
    99.7: 3
};

export const confidenceIntervalOfProject = (p: Project, interval: ConfidenceInterval) => {
    const estimate = wheightedAverageOfTasks(p.tasks);
    const error = standardErrorOTasks(p.tasks);
    const coEfficient = confidenceIntervalCoEfficients[interval];
    return {
        min: estimate - coEfficient * error,
        max: estimate + coEfficient * error
    };
};

export const confidenceIntervalsOfProject = (p: Project) => confidenceIntervals.map(interval => ({
    interval,
    ...confidenceIntervalOfProject(p, interval)
}));


export function tagsOf(p: Project) {
    const tagSet: Set<string> = new Set();
    p.tasks.forEach(task => task.tags.forEach(tag => tagSet.add(tag)));
    return [...tagSet];
}