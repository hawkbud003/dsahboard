export interface Creative {
    id: number;
    name: string;
    creative_type: string;
    file?: string;
    description?: string;
}

export interface CreativeFormData {
    name: string;
    creative_type: string;
    file: File;
    description?: string;
}

