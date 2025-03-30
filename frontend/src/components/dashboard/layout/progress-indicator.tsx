import { Box, Typography } from '@mui/material';

export const ProgressIndicator = ({ activeSection, totalSections }: { activeSection: number; totalSections: number }) => {
  return (
    <Box sx={{ width: '100%', mb: 3 }}>
      <Typography variant="body2" sx={{ textAlign: 'center', mb: 1 }}>
        Step {activeSection + 1} of {totalSections}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            flex: 1,
            height: 8,
            borderRadius: 4,
            bgcolor: 'grey.300',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              width: `${((activeSection + 1) / totalSections) * 100}%`,
              height: '100%',
              bgcolor: 'primary.main',
              transition: 'width 0.3s ease',
            }}
          />
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {Math.round(((activeSection + 1) / totalSections) * 100)}%
        </Typography>
      </Box>
    </Box>
  );
};