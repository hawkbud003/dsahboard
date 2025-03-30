import { Box, Divider, Typography } from "@mui/material";
interface ImpressionProps{
  title: string
  targetPopulation: number;
  totalPopulation: number;
}

export function ImpressionComponent({
  title,
  totalPopulation = 0,
  targetPopulation = 0,
}: ImpressionProps): React.JSX.Element {

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

    return (
      <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        width: "100%",
        padding: 2,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
       {title}
      </Typography>
      {/* Data Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <Typography variant="body2" sx={{ flex: 1, textAlign: 'center' }}>
          <strong>Total Population</strong>: {formatNumber(totalPopulation)}
        </Typography>
        <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
        <Typography variant="body2" sx={{ flex: 1, textAlign: 'center' }}>
          <strong>Target Population</strong>: {formatNumber(targetPopulation)}
        </Typography>
      </Box>
    </Box>
    );
}