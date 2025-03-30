"use client"
import { utils } from '@/lib/common-utils';
import { creativeClient } from '@/lib/CreativeClient';
import { paths } from '@/paths';
import { CreativeFormData } from '@/types/creative';
import { CreativeFormSchema } from '@/types/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, CircularProgress, Grid, Typography } from '@mui/material';
import { FileDoc, Image, Tag, Video } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { FieldError, useForm } from 'react-hook-form';
import FormField from '../layout/form-field';
import { DetailGrid, DetailRow, SectionContainer } from '../layout/section-container';
import { TypeSelector } from '../layout/type-selector';
import { useFormSections } from '@/hooks/useFormSections';

const campaignTypes = [
  { id: 'banner', label: 'Banner', icon: Image },
  { id: 'video', label: 'Video', icon: Video },
  { id: 'TagTracker', label: 'Tag&Tracker', icon: Tag },
  { id: 'keyword', label: 'Keyword', icon: FileDoc },
];

const fields = [
	{ label: 'Creative Type', name: 'creative_type' },
	{ label: 'Name', name: 'name' },
	{ label: 'Description', name: 'description' },
	{ label: 'File', name: 'file' }
];

export default function CreateCreative(): React.JSX.Element {
    const router = useRouter();
    const [isPending, setIsPending] = React.useState(false);
    const [isCreativeCreated, setIsCreativeCreated] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [creativeType, setCreativeType] = React.useState<string>('');
	const { activeSection, nextSection, prevSection } = useFormSections(2);
	const mandatoryFieldsBySection: Record<number, string[]> = {
        0: ["creative_type"], 
        1: ["name","file"],
        2: [],
    };
    
    const {
      register,
      setValue,
      setError,
      clearErrors,
      handleSubmit,
      getValues,
      formState: { errors },
    } = useForm<CreativeFormData>({ resolver: zodResolver(CreativeFormSchema) });
    
    const handleNextSection = () => {
        const mandatoryFields = mandatoryFieldsBySection[activeSection];
        nextSection(getValues, setError, clearErrors, mandatoryFields);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
			console.log(file);
      if (file) {
        setSelectedFile(file);
        setValue('file',file);
      }
      e.target.value = '';
    };

    const getAcceptTypes = (type: string): string => {
      switch (type) {
        case 'banner':
            return 'image/*';
        case 'video':
            return 'video/*';
        case 'tagtracker':
        case 'keyword':
            return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        default:
            return '';
      }
    };

    const onSubmit = async (data: CreativeFormData) => {
      clearErrors();
      setIsPending(true);
      try {
        const result = await creativeClient.createCreative(data);
        if (result) {
					setIsCreativeCreated(true);
					router.push(paths.dashboard.creative);
        }
      } catch (error:any) {
        setError('root', { type: 'server', message: error.message});
      } finally {
        setIsPending(false);
      }
    };
  
    return (
      <Box
        sx={{
          margin: "0 auto",
          maxWidth: "md",
          p: { xs: 1, sm: 2, md: 3 },
        }}
      >
				<form onSubmit={handleSubmit(onSubmit)}>
					<Box sx={{ display: "flex", 
							flexDirection: "column",
							gap: 3 ,
							border: 1,
							padding:2 ,
							borderColor: "grey.300",
					}}>

						{activeSection === 0 && (
							<SectionContainer title="Creative Type">
								<DetailGrid>
									<Grid item xs={12}>
										<TypeSelector
											name="creative_type"
											selectedType={creativeType}
											setSelectedType={setCreativeType}
											setValue={setValue}
											options={campaignTypes}
										/>
                    <Typography variant="caption" color="error.main">
                      {errors.creative_type?.message}
                    </Typography>
									</Grid>
								</DetailGrid>
							</SectionContainer>
						)}

						{activeSection === 1 && (
							<SectionContainer title="Creative Details">
								<DetailGrid>
									{/* Name Field - Full Width */}
									<Grid item xs={12}>
											<FormField
											type="text"
											placeholder="Name"
											name="name"
											getValues={getValues}
											setValue={setValue}
											register={register}
											error={errors.name as FieldError}
											/>
									</Grid>

									{/* Description Field - Full Width */}
									<Grid item xs={12}>
											<FormField
												type="textarea"
												placeholder="Description"
												name="description"
												getValues={getValues}
												setValue={setValue}
												register={register}
												error={errors.description as FieldError}
											/>
									</Grid>

									{/* Creative Type Field - Full Width */}
									<Grid item xs={12}>
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												border: "2px dashed",
												borderColor: "primary.main",
												borderRadius: "8px",
												cursor: "pointer",
												transition: "border-color 0.3s ease",
												"&:hover": {
													borderColor: "primary.dark",
												},
											}}
										>
											<input
												className='logo'
												accept={getAcceptTypes(creativeType)}
												style={{ display: 'none' }}
												id="creative-file-upload"
												type="file"
												onChange={handleFileChange}
											/>
											<Button
												component="span"
												fullWidth
												sx={{
												textAlign: 'center',
												justifyContent: 'center',
												color: errors.file ? 'error.main' : 'primary.main'
												}}
												onClick={() => (document.querySelector(`input[type="file"].${"logo"}`) as HTMLInputElement).click()}
											>
												{selectedFile?.name || `Select ${creativeType} file`}
											</Button>
										</Box>
										{errors.file && (
											<Typography variant="caption" color="error.main">
												{errors.file?.message}
											</Typography>
										)}
									</Grid>
								</DetailGrid>
							</SectionContainer>
						)}

						{activeSection === 2 && (
							 <SectionContainer title="Review">
                <DetailGrid>
                  {fields.map((field) => (
                    <DetailRow   
                          key={field.label}
                          label={field.label}
                          value={utils.formatAndGetReviewCreativeData(field.name,getValues)}
                      />
                  ))}
                </DetailGrid>
             </SectionContainer>
						)}

						<Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
							<Button variant="outlined" onClick={prevSection} disabled={activeSection === 0}>
								Previous
							</Button>
							{activeSection < 2 && (
								<Button variant="contained" color="primary" onClick={handleNextSection}>
									Next
								</Button>
							)}
						</Box>
						{activeSection === 2 && (
							<Box sx={{ textAlign: "center", mt: 3 }}>
								{!isPending ? (
									<Button sx={{borderRadius:0.75}} variant="contained" color="primary" type="submit">
										Create Creative
									</Button>
								) : (
									<Box sx={{ marginLeft: 2 }}>
										<CircularProgress />
									</Box>
								)}
							</Box>
						)}
						<Box sx={{ mt: 2 }}>
							{errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
							{isCreativeCreated ? <Alert sx={{margin:2}} color="success">Creative created successfully!</Alert> : null}
						</Box>
					</Box>
				</form>
      </Box>
    );
  }

  