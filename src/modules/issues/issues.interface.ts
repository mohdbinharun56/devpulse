export interface IIssues {
    title: string;
    description: string;
    type: "bug" | "feature_request";
    status?: "open" | "in_progress" | "resolved";
}

export interface IFormattedIssue extends IIssues {
    id: number,
    status: 'open' | 'in_progress' | 'resolved',
    reporter_id: number,
    created_at: Date,
    updated_at: Date
}
export interface IReporter {
    id: number;
    name: string;
    role: string;
}

export interface IUser {
    id: number;
    name: string;
    email: string;
    role: "contributor" | "maintainer";
    iat: number,
    exp: number
}

export interface IGetIssueQuery {
    sort?: "newest" | "oldest";
    type?: "bug" | "feature_request";
    status?: "open" | "in_progress" | "resolved";
}
