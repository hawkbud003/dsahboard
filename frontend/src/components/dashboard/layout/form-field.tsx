import { utils } from '@/lib/CommonUtils';
import { User } from '@/types/auth';
import { CommonSelectResponse, Interest, Location } from '@/types/campaign';
import { Creative } from '@/types/creative';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import dayjs from 'dayjs';
import { truncate } from 'fs/promises';
import Link from 'next/link';
import React from 'react';
import { FieldError, UseFormGetValues, UseFormRegister, UseFormSetValue } from "react-hook-form";

interface FormFieldProps<T>  {
  name: string;
  type: string;
  placeholder: string;
  error: FieldError | undefined;
  valueAsNumber?: boolean;
  data?: T[];
  disabled?:boolean
  hidePasswordIcon?:boolean;
  multiple?:boolean;
  register: UseFormRegister<any>;
  getValues?: UseFormGetValues<any>;
  setValue?: UseFormSetValue<any>;
  onChange?: (event: SelectChangeEvent<unknown>, name: string) => void; // Updated type
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const FormField: React.FC<FormFieldProps<any>> = ({
  name,
  type,
  placeholder,
  error,
  valueAsNumber,
  data,
  disabled = false,
  hidePasswordIcon = false,
  multiple = true,
  register,
  onChange,
  getValues,
  setValue
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const labelId = `${name}-label`; // Unique label ID for Select

  // Handle Checkbox Type
  const renderCheckbox = () => (
    <FormControlLabel
      control={<Checkbox {...register(name)} />}
      label={
        <React.Fragment>
          <Link href="/terms">{placeholder}</Link>
        </React.Fragment>
      }
    />
  );

  // Handle TextField Types (text, password, etc.)
  const renderTextField = () => (
    <TextField
      type={type === 'password' && showPassword ? 'text' : type}
      fullWidth
      disabled={disabled}
      {...register(name, { valueAsNumber })}
      label={placeholder}
      InputProps={
        type === 'password' && !hidePasswordIcon
          ? {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((prev) => !prev)}>
                    {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }
          : undefined
      }
    />
  );

  const renderMultipleLineTextField = () => (
    <TextField
      type={type}
      fullWidth
      multiline
      rows={8}
      disabled={disabled}
      {...register(name, { valueAsNumber })}
      label={placeholder}
    />
  );


  // Handle Select Types
  const renderSelect = () => {
    const renderMenuItems = () => {
      if (name === 'location') {
        return data?.map((val: Location) => (
          <MenuItem key={val.id} value={val.id}>
        {val.city}
          </MenuItem>
        ));
      } else if (name.startsWith('target_type')) {
        return data?.map((val: Interest) => (
          <MenuItem key={val.id} value={val.id}>
        {val.subcategory}
          </MenuItem>
        )); 
      } else if (name.startsWith('user')) {
        return data?.map((val: User) => (
          <MenuItem key={val.id} value={val.id}>
            {utils.formatProperCase(val.first_name)} {utils.formatProperCase(val.last_name)}({val.email}) - {val.profile?.company_name}
          </MenuItem>
        )); 
      } else if (name.startsWith('creative')) {
        return data?.map((val: Creative) => (
          <MenuItem key={val.id} value={val.id}>
            {utils.formatProperCase(val.name)}({val.creative_type})
        </MenuItem>
      )); 
    } else {
        return data?.map((val: CommonSelectResponse) => (
          <MenuItem key={val.id} value={val.value}>
        {val.label}
          </MenuItem>
        ));
      }
    };

    return (
      <>
        <InputLabel id={labelId}>{placeholder}</InputLabel>
        <Select
          fullWidth
          multiple={multiple}
          MenuProps={MenuProps}
          defaultValue={getValues && getValues(name) ? getValues(name) : multiple ? [] : ''}
          label={placeholder}
          labelId={labelId}
          onChange={(e) => {
            setValue && setValue(name,e.target.value)
            return onChange && onChange(e, name)
          }}
        >
          {renderMenuItems()}
        </Select>
      </>
    );
  };

  // Handle DatePicker Type
  const renderDatePicker = () => {
    const minDate = new Date();
    const value = getValues && getValues(name);
  
    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label={placeholder}
          value={value ? new Date(value) : null}
          minDate={minDate}
          onChange={(date) => {
            if (date && !isNaN(date.getTime())) {
              const formattedDate = dayjs(date).format('YYYY-MM-DD');
              setValue && setValue(name, formattedDate);
            }
          }}
        />
      </LocalizationProvider>
    );
  };

  // Render the appropriate field based on the type
  const renderField = () => {
    switch (type) {
      case 'checkbox':
        return renderCheckbox();
      case 'text':
      case 'password':
      case 'number':
      case 'email':
        return renderTextField();
      case 'textarea':
        return renderMultipleLineTextField();
      case 'select':
        return renderSelect();
      case 'datepicker':
        return renderDatePicker();
      default:
        return null;
    }
  };

  return (
    <FormControl fullWidth error={Boolean(error)}>
      {renderField()}
      {error && <FormHelperText>{error.message}</FormHelperText>}
    </FormControl>
  );
};

export default FormField;