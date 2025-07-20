import React, { Component } from "react";
import { Formik, Form, FieldAttributes, useField } from "formik";
import { TextField } from "@material-ui/core";
import * as yup from "yup";
import "./AdditionalInfo.css";

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
      />
    </div>
  );
};

const validationSchema = yup.object({
  MinE: yup.string().required().max(10),

  WType: yup.string().required(),

  Address: yup.string().required().max(50),

  Department: yup.string().required().max(20),

  Salary: yup.string().required().max(15),
});
interface IPropsAdd {
  nextStep: () => void;
  values3: {
    MinE: string;
    WType: string;
    Address: string;
    Department: string;
    Salary: string;
  };
  handleChange: (value: string) => void;
}
export class AdditionalInfo extends Component<IPropsAdd> {
  render() {
    const { values3, handleChange } = this.props;
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
                <label className="labelll">Ø­Ø¯Ø§ÙÙ Ø³Ø§Ø¨ÙÙ Ú©Ø§Ø±</label>
                <div>
                  <MyTextField
                    style={{ width: "60%" }}
                    placeholder="2 Ø³Ø§Ù"
                    name="MinE"
                    type="input"
                    defaultValue={values3.MinE}
                    onChange={() => handleChange("MinE")}
                  />
                </div>
                <label className="labelll">ÙÙØ¹ ÙÙÚ©Ø§Ø±Û</label>
                <div>
                  <MyTextField
                    style={{ width: "60%" }}
                    placeholder="ØªÙØ§Ù ÙÙØª"
                    name="WType"
                    type="input"
                    defaultValue={values3.WType}
                    onChange={() => handleChange("WType")}
                  />
                </div>
                <label className="labelll">ÙÙÙØ¹ÛØª ÙÚ©Ø§ÙÛ</label>
                <div>
                  <MyTextField
                    style={{ width: "60%" }}
                    placeholder="Ø¬Ø±Ø¯Ù"
                    name="Address"
                    type="input"
                    defaultValue={values3.Address}
                    onChange={() => handleChange("Address")}
                  />
                </div>
                <label className="labelll">Ø¯Ù¾Ø§Ø±ØªÙØ§Ù</label>
                <div>
                  <MyTextField
                    style={{ width: "60%" }}
                    placeholder="NTO"
                    name="Department"
                    type="input"
                    defaultValue={values3.Department}
                    onChange={() => handleChange("Department")}
                  />
                </div>
                <label className="labelll">Ø­ÙÙÙ Ù¾ÛØ´ÙÙØ§Ø¯Û</label>
                <div>
                  <MyTextField
                    style={{ width: "60%" }}
                    placeholder="6 ÙÛÙÛÙÙ ØªÙÙØ§Ù"
                    name="Salary"
                    type="string"
                    defaultValue={values3.Salary}
                    onChange={() => handleChange("Salary")}
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
