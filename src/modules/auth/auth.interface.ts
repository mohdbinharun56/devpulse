export interface IAuthSignup {
    name: string;
    email: string;
    password: string;
    role: 'contributor' | 'maintainer';
}

export interface IAuthLogin {
    email: string;
    password: string;
}