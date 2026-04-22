export interface User {
    userId: string;
    username: string;
    email: string;
    fName?: string;
    lName?: string;
    role: 'admin' | 'customer';
}