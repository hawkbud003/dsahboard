import { Box, Button, Grid, IconButton, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { Copy, Download } from "@phosphor-icons/react";

const getValueOrNA = (value: any): string => {
    return value !== undefined && value !== null && value !== "" && value !== 0 
      && value !== "0" && value !== 0.0 && value !== "0.00" ? value : "Not Available";
};

// Section Container Component
export const SectionContainer: React.FC<{ title: string; children: React.ReactNode }> = ({ 
    title, 
    children 
  }) => (
    <Box sx={{ 
      borderBottom: 1, 
      borderColor: 'divider', 
      pb: 3,
      '&:last-child': { borderBottom: 0 }
    }}>
      <Typography variant="h6" gutterBottom sx={{ 
        fontWeight: 600,
        color: 'text.primary',
        mb: 3
      }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
  
  // Detail Grid Layout
  export const DetailGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Grid container spacing={3}>{children}</Grid>
  );
  
  // Detail Row Component
  export const DetailRow: React.FC<{ 
    label: string; 
    value: any;
    onCopy?: () => void;
  }> = ({ label, value, onCopy }) => (
    <Grid item xs={12} sm={6} md={4}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        bgcolor: 'background.default',
        borderRadius: 1,
        border:1,
        borderColor: grey[200],
        p: 2,
        height: '100%'
      }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle2" sx={{ 
            color: 'text.secondary',
            mb: 0.5
          }}>
            {label}
          </Typography>
          <Typography variant="body2" sx={{
            color: 'text.primary',
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {getValueOrNA(value)}
          </Typography>
        </Box>
        {value && onCopy && (
          <IconButton 
            size="small" 
            onClick={onCopy}
            sx={{ color: 'text.secondary' }}
          >
            <Copy size={16} />
          </IconButton>
        )}
      </Box>
    </Grid>
  );
  
  // File Download Component
  export const FileDownloadItem: React.FC<{ 
    label: string;
    onDownload: () => void;
  }> = ({ label, onDownload }) => (
    <Grid item xs={12} sm={6} md={4}>
      <Button
        fullWidth
        variant="outlined"
        startIcon={<Download size={16} />}
        onClick={onDownload}
        sx={{
          justifyContent: 'space-between',
          textTransform: 'none',
          py: 1.5,
          px: 2
        }}
      >
        <Typography variant="body2" noWrap sx={{ 
          flexGrow: 1, 
          textAlign: 'left',
          mr: 2
        }}>
          {label}
        </Typography>
      </Button>
    </Grid>
  );