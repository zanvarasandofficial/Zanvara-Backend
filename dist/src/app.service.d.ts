export declare class AppService {
    getRoot(): {
        name: string;
        version: string;
        docs: {
            health: string;
            auth: {
                register: string;
                login: string;
                me: string;
            };
            admin: string;
        };
    };
}
