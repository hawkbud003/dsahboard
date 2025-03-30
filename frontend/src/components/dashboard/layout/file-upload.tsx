"use client";
import { campaignClient } from "@/lib/CampaignClient";
import { Alert, Box, Button, CircularProgress } from "@mui/material";
import React, { useState } from "react";
import { UseFormGetValues, UseFormRegister, UseFormSetValue } from "react-hook-form";

interface FileUploadProps {
  name: string;
  placeholder: string;
  register: UseFormRegister<any>;
  getValue: UseFormGetValues<any>;
  setValue: UseFormSetValue<any>;
}

export default function FileUpload({
  name,
  placeholder,
  register,
  setValue,
  getValue
}: FileUploadProps): React.JSX.Element {

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [isFileUploaded,setIsFileUploaded] = useState<boolean>(false);

  const validateFile = (selectedFile: File, name: string) => {
    // File type validation
    const isImageType = selectedFile.type.startsWith('image/');
    const isZipType = [
      'application/zip',
      'application/x-zip-compressed',
      'application/octet-stream'
    ].includes(selectedFile.type);
    const isVideoType = selectedFile.type.startsWith('video/');
    const isPDFType = selectedFile.type === 'application/pdf';
    const isExcelType = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ].includes(selectedFile.type);
    // Size limits in bytes
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
    const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB
  
    // Validation based on upload type
    switch (name) {
      case 'images':
        if (!(isImageType || isZipType)) {
          setError("Invalid file type. Only images (PNG, JPEG, etc.) and ZIP files are allowed.");
          return false;
        }
        if (selectedFile.size > MAX_IMAGE_SIZE) {
          setError("Image/ZIP file size cannot exceed 10MB.");
          return false;
        }
        break;
  
      case 'video':
        if (!(isVideoType|| isZipType)) {
          setError("Invalid file type. Only video files are allowed.");
          return false;
        }
        if (selectedFile.size > MAX_VIDEO_SIZE) {
          setError("Video file size cannot exceed 500MB.");
          return false;
        }
        break;
  
      case 'keywords':
        if (!isExcelType) {
          setError("Invalid file type. Only Excel file is allowed.");
          return false;
        }
        break;
      
      case 'tag_tracker':
        if (!isExcelType) {
          setError("Invalid file type. Only Excel file is allowed.");
          return false;
        }
        break;
  
      default:
        setError("Invalid upload category.");
        return false;
    }
  
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files) {
      const selectedFile = e.target.files[0];
       // Usage
      if (selectedFile) {
        const isValid = validateFile(selectedFile, name);
        if (!isValid) return;
      }
      setFile(selectedFile);
      handleUpload(selectedFile);
    }
  };

  const handleUpload = async (selectedFile:File) => {
    if (!selectedFile) return;
    setUploading(true);
    setError("");
    try {
      const id = await campaignClient.uploadFile(selectedFile, name.toString(),-1); // Upload the file
      setUploadSuccess(true);
      setIsFileUploaded(true);
      setValue(name, [id]); // Update form state with the uploaded file's ID
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  React.useEffect(() => {
    setIsFileUploaded(getValue(name)?.length > 0);
  });
  return (
    <Box>
      {!uploading && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              border: "2px dashed",
              borderColor: "primary.main", // Primary color for the dotted border
              borderRadius: "8px",
              cursor: "pointer",
              transition: "border-color 0.3s ease",
              "&:hover": {
                borderColor: "primary.dark", // Change border color on hover
              },
            }}
          >
            {/* Hidden file input */}
            <input
              className={name}
              {...register(name)} // Register the input with React Hook Form
              type="file"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <Button
              component="span"
              fullWidth
              sx={{ color: "primary.main", paddingLeft: 2 }}
              onClick={() => (document.querySelector(`input[type="file"].${name}`) as HTMLInputElement).click()}
            >
              {placeholder}
            </Button>
          </Box>
      )}

      {uploading && (
          <Box display="flex" justifyContent="flex-start" alignItems="center">
            <Box sx={{ marginLeft: 2 }}>
              <CircularProgress />
            </Box>
          </Box>
      )}

      {/* Display error if any */}
      {error && (
        <Box sx={{ marginTop: 2 }}>
          <Alert color="error">{error}</Alert>
        </Box>
      )}

      {/* Display success message after upload */}
      {(uploadSuccess || isFileUploaded) && (
        <Box sx={{ marginTop: 2 }}>
          <Alert color="success">Uploaded {file?.name}</Alert>
        </Box>
      )}
    </Box>
  );
}
