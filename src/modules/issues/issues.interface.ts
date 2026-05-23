export interface IIssues {
    title: string;
    description: string;
    type: "bug" | "feature_request";
}

export interface IReporter {
    id: number; 
    name: string; 
    role: string;
}