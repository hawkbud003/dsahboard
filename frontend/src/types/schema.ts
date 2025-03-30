import { z, ZodType } from "zod";
import { ProfileFormData, SignInFormData, SignUpFormData } from "./auth";
import { CampaignFormData } from "./campaign";
import { CreativeFormData } from "./creative";

export const CampaignFormSchema: ZodType<CampaignFormData> = z.object({
    name: z.string().min(4, { message: "Name is required" }),
    objective: z.string({ message: "Objective is required" }),
    age: z.array(z.string(), { message: "Age is required" }),
    environment: z.array(z.string(), { message: "Environment is required" }),
    location: z.array(z.number(), { message: "Location is required" }),
    device: z.array(z.string(), { message: "Device is required" }),
    target_type: z.array(z.number(), { message: "Interest is required" }),
    exchange: z.array(z.string(), { message: "Exchange is required" }),
    language: z.array(z.string(), { message: "Language is required" }),
    carrier: z.array(z.string(), { message: "Carrier is required" }),
    device_price: z.array(z.string(), { message: "Device Price is required" }), 
    total_budget: z.number({ message: "Total Budget is required" }),
    buy_type: z.string({ message: "Buy Type is required" }),
    unit_rate: z.number({ message: "Unit Rate is required" }),
    brand_safety: z.number({ message: "Brand Safety is required" }),
    viewability: z.number({ message: "Viewability is required" }),
    start_time: z.any(),
    end_time: z.any(),
    landing_page: z.any(),
    user: z.any(),
    creative: z.any(),
  });


  export const profileSchema: ZodType<ProfileFormData> = z.object({
    first_name: z.string().min(5, { message: 'First name  is required & must be at least 5 characters long' }),
    last_name: z.string().min(5, { message: 'Last name  is required & must be at least 5 characters long' }),
    phone_no: z.string().regex(/^\d{10}$/, { message: 'Phone number must be exactly 10 digits' }),
    email: z.string().email({ message: 'Email is required' }),
    company_name: z.string().min(1, { message: 'Company Name is required' }),
    gst: z.string().regex(/^\d{15}$/, { message: 'GST number must be exactly 15 digits' }),
  });

  export const signInSchema: ZodType<SignInFormData> = z.object({
    username: z.string().min(1, { message: 'Email is required' }).email(),
    password: z.string().min(1, { message: 'Password is required' }),
  });
  

  export const signUpSchema: ZodType<SignUpFormData> = z.object({
    first_name: z.string().min(5, { message: 'First name must be at least 5 characters long' }),
    last_name: z.string().min(5, { message: 'Last name must be at least 5 characters long' }),
    email: z.string().min(1, { message: 'Email is required' }).email(),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' })
      .regex(
        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
        'Password must include at least one uppercase letter, one number, and one special character'
      ),
    terms: z.boolean().refine((value) => value, 'You must accept the terms and conditions'),
    company_name: z.string().min(1, { message: 'Company Name is required' }),
    gst: z.any(),
    logo: z.instanceof(File, { message: "File is required" })
      .refine((file) => file.size <= 5000000, { message: "File size must be less than 5MB" })
      .refine(
        (file) => ['image/jpeg', 'image/png'].includes(file.type),
        { message: "File must be an image (JPEG, PNG)" }
      ),
  });


  export const updatePaswordSchema = z.object({
    old_password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' })
      .regex(
        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
        'Password must include at least one uppercase letter, one number, and one special character'
      ),
    new_password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' })
      .regex(
        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
        'Password must include at least one uppercase letter, one number, and one special character'
      ),
      confirm_new_password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' })
      .regex(
        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
        'Password must include at least one uppercase letter, one number, and one special character'
      ),
    }).refine((data) => data.new_password === data.confirm_new_password, {
      message: "Passwords don't match",
      path: ['confirm_new_password'],
  });

  export const CreativeFormSchema: ZodType<CreativeFormData> = z.object({
    name: z.string({ message: "Name is required" }),
    creative_type: z.string({ message: "Creative Type is required" }),
    file: z.instanceof(File, { message: "File is required" }),
    description: z.any(),
  });

