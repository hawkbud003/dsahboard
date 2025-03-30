import { utils } from '@/lib/CommonUtils';
import { useState } from 'react';
import { UseFormClearErrors, UseFormGetValues, UseFormSetError } from 'react-hook-form';
import dayjs from 'dayjs';

type ValidationRule = {
  validate: (value: any, getValues?: UseFormGetValues<any>) => boolean;
  message: string;
};

const validationRules: Record<string, ValidationRule> = {
  default: {
    validate: (value) => value !== undefined && value !== null && value !== "" && 
      (!Array.isArray(value) || value.length > 0),
    message: "field is required"
  },
  numeric: {
    validate: (value) => !isNaN(Number(value)) && Number(value) > 0,
    message: "must be a positive number"
  },
  file: {
    validate: (value) => value instanceof File && value.size > 0,
    message: "is required"
  },
  endDate: {
    validate: (value, getValues) => {
      const startDate = getValues?.("start_time");
      if (!startDate || !value) return false;
      return dayjs(value).isAfter(dayjs(startDate));
    },
    message: "should be after start date"
  }
};

export const useFormSections = (maxSections: number) => {
  const [activeSection, setActiveSection] = useState(0);
  
  const validateField = (
    field: string,
    value: any,
    getValues: UseFormGetValues<any>,
    rules?: Record<string, ValidationRule>
  ): { isValid: boolean; message?: string } => {
    let rule = validationRules.default;

    // Common validations
    if (["total_budget", "unit_rate"].includes(field)) {
      rule = validationRules.numeric;
    } else if (field === "end_time") {
      rule = validationRules.endDate;
    } else if (field === "file") {
      rule = validationRules.file;
    }

    // Allow custom rules to override defaults
    if (rules?.[field]) {
      rule = rules[field];
    }

    const isValid = rule.validate(value, getValues);
    return {
      isValid,
      message: isValid ? undefined : `${utils.formatProperCase(field.toString().replace(/_/g, " "))} ${rule.message}`
    };
  };

  const nextSection = (
    getValues: UseFormGetValues<any>,
    setError: UseFormSetError<any>,
    clearErrors: UseFormClearErrors<any>,
    mandatoryFields: string[],
    customRules?: Record<string, ValidationRule>
  ): boolean => {
    let isValid = true;

    mandatoryFields.forEach((field) => {
      const value = getValues(field);
      const validation = validateField(field, value, getValues, customRules);
      
      if (!validation.isValid) {
        isValid = false;
        setError(field, {
          type: "validation",
          message: validation.message
        });
      }
    });

    if (!isValid) {
      return false;
    }

    clearErrors();
    if (activeSection < maxSections) {
      setActiveSection(activeSection + 1);
      window.scrollTo(0, 0);
      return true;
    }
    return false;
  };

  const prevSection = () => {
    setActiveSection(prev => Math.max(0, prev - 1));
    window.scrollTo(0, 0);
  };

  return { activeSection, nextSection, prevSection };
}; 