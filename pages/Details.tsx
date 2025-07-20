import React, { Component } from "react";
import { Formik, Form, FieldAttributes, useField } from "formik";
import { TextField } from "@material-ui/core";
import * as yup from "yup";
import "./Details.css";

const MyTextField: React.FC<FieldAttributes<{}>> = ({
  placeholder,
  type,
  className,
  style,
  defaultValue,
  ...props
}) => {
  const [field, meta] = useField<{}>(props);
  const errorText = meta.error && meta.touched ? meta.error : "";
  return (
    <div className="container">
      <TextField
        placeholder={placeholder}
        className={className}
        style={style}
        type={type}
        {...field}
        helperText={errorText}
        error={!!errorText}
        id="outlined-basic"
        variant="outlined"
        multiline
        rows={16}
        rowsMax={12}
      />
    </div>
  );
};

const validationSchema = yup.object({
  Details: yup.string().required().max(500),
});
interface IPropsDetails {
  nextStep: () => void;
  values2: {
    Detailss: string;
  };
  handleChange: (value: string) => void;
}

export class Details extends Component<IPropsDetails> {
  render() {
    const { handleChange, values2 } = this.props;
    return (
      <div>
        <Formik
          validateOnChange={true}
          validationSchema={validationSchema}
          initialValues={{
            Title: "",
            ActivationDate: "",
            ExpirationDate: "",
            DirectManager: "",
            HRBP: "",
          }}
          onSubmit={(data) => {
            console.log(data);
          }}
        >
          {({ values, errors }) => (
            <Form id="my-form">
              <div>
                <label className="labell">: ØªÙØ¶ÛØ­Ø§Øª ÙØ±ØµØª Ø´ØºÙÛ</label>
                <div>
                  <MyTextField
                    style={{ fontFamily: "IranSans", width: "65%" }}
                    placeholder="....."
                    name="Detailss"
                    type="input"
                    onChange={() => handleChange("Detailss")}
                    defaultValue={values2.Detailss}
                  />
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    );
  }
}
