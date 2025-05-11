export interface Job {
    title: string;
    description: string;
    endDate: string;
}

export interface User {
    name: string;
    surname: string;
    username: string;
    email: string;
    password: string;
    jobs: Job[];
}
