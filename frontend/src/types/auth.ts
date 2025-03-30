export interface Auth {
    token: string;
    usertype: string;
}

export interface SignInFormData {
    username: string;
    password: string;
}

export interface UpdatePasswordParams {
    old_password: string;
    new_password: string;
    confirm_new_password: string;
}

export interface ResetPasswordParams {
    email: string;
}

export interface Profile{
    phone_no:string;
    city:string;
    company_name: string;
    gst: string;
    logo: string | null;
}

export interface User {
    id:number;
    email: string;
    first_name: string;
    last_name: string;
    phone_no?: string;
    password?:string;
    user_type?: boolean
    company_name:string;
    gst?:string
    logo?:string
    profile?:Profile

}

export interface ProfileFormData {
    email: string;
    first_name: string;
    last_name: string;
    phone_no: string;
    company_name:string;
    gst:string
}

export interface SignUpFormData {
    email: string;
    first_name: string;
    last_name: string;
    phone_no?: string;
    password?:string;
    terms?:boolean
    user_type?: boolean
    company_name:string;
    gst?:string
    logo:File
}
  

export interface Profile{
    phone_no:string;
    city:string; 
}
export interface Customer {
    id:number;
    email: string;
    first_name: string;
    last_name: string;
    phone_no?: string;
    password?:string;
    terms?:boolean;
    date_joined?:string;
    profile?:Profile;
}