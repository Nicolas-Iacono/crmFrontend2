import React, { useState } from "react";
import { TextField, IconButton, InputAdornment} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Field } from "formik";


export const PasswordTextField = ({ handleChange, handleBlur, values }) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  <Field />;
  return (
    <Field
      name="password"
      as={TextField}
      label="Contraseña"
      variant="outlined"
      onChange={handleChange}
      onBlur={handleBlur}
      value={values.password}
      type={showPassword ? "text" : "password"}
      fullWidth
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={handleTogglePasswordVisibility} edge="end">
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default PasswordTextField;
