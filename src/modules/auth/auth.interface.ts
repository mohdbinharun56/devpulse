export interface IAuthSignup {
    name: string;
    email: string;
    password: string;
    role: 'contributor' | 'maintainer';
}