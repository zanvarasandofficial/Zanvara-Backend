import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
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
