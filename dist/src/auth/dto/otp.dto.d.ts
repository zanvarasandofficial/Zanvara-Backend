export declare class RequestOtpDto {
    email: string;
    name?: string;
    forSignup?: boolean;
}
export declare class VerifyOtpDto {
    email: string;
    code: string;
    name?: string;
    password?: string;
}
