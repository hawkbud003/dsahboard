import { Box, Grid, Typography } from '@mui/material';
import { IconProps } from '@phosphor-icons/react';
import { UseFormSetValue } from 'react-hook-form';

interface TypeOption {
  id: string;
  label: string;
  icon: React.ForwardRefExoticComponent<IconProps>;
}

interface TypeSelectorProps {
  name: string;
  selectedType: string;
  setSelectedType: (type: string) => void;
  setValue?: UseFormSetValue<any>;
  options: TypeOption[];
}

export const TypeSelector = ({ 
  name,
  selectedType,
  setSelectedType,
  setValue,
  options 
}: TypeSelectorProps) => {
  return (
      <Grid 
        container 
        spacing={3} 
        justifyContent="center" 
        alignItems="center"
      >
        {options.map((option) => (
          <Grid 
            key={option.id}
            item 
            xs={12}
            sm={12}
            md={6}
            lg={6}
            display="flex" 
            justifyContent="center"
          >
            <Box
              sx={{
                border: "2px solid",
                borderColor: selectedType === option.id ? "primary.main" : "grey.300",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: 2,
                padding: 3,
                cursor: "pointer",
                width: "100%",
                maxWidth: "400px",
                height: "100px",
                backgroundColor: selectedType === option.id ? "primary.main" : "background.paper",
                color: selectedType === option.id ? "white" : "text.primary",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: selectedType === option.id ? "primary.dark" : "grey.50",
                  transform: "translateY(-2px)",
                  boxShadow: 2,
                },
                justifyContent: "center",
              }}
              onClick={() => {
                setSelectedType(option.id);
                setValue && setValue(name, option.id);
              }}
            >
              <option.icon size={36} weight="bold" />
              <Typography variant="body1">{option.label}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
  );
};





