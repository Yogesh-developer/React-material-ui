import React, { Component } from "react";
import { Formik, Form, FieldAttributes, useField } from "formik";
import { TextField } from "@material-ui/core";
import * as yup from "yup";
import "./MainInfo.css";

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
        defaultValue={defaultValue}
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
  Title: yup.string().required().max(15),

  ActivationDate: yup.date().required(),

  ExpirationDate: yup.date().required(),

  DirectManager: yup.string().required().max(15),

  HRBP: yup.string().required().max(15),
});
interface IProps {
  nextStep: () => void;
  values1: {
    Title: string;
    ActivationDate: string;
    ExpirationDate: string;
    DirectManager: string;
    HRBP: string;
  };
  handleChange: (value: string) => void;
}
export class MainInfo extends Component<IProps> {
  render() {
    const { values1, handleChange } = this.props;
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
                <label className="label">Ø¹ÙÙØ§Ù</label>
                <div>
                  <MyTextField
                    style={{ width: "60%" }}
                    placeholder="Ø·Ø±Ø§Ø­"
                    name="Title"
                    type="input"
                    onChange={() => handleChange("Title")}
                    defaultValue={values1.Title}
                  />
                </div>
                <label className="label">ØªØ§Ø±ÛØ® ÙØ¹Ø§ÙØ³Ø§Ø²Û</label>
                <div>
                  <MyTextField
                    style={{ width: "60%" }}
                    name="ActivationDate"
                    type="date"
                    onChange={() => handleChange("ActivationDate")}
                    defaultValue={values1.ActivationDate}
                  />
                </div>
                <label className="label">ØªØ§Ø±ÛØ® ØºÛØ± ÙØ¹Ø§ÙØ³Ø§Ø²Û</label>
                <div>
                  <MyTextField
                    style={{ width: "60%" }}
                    placeholder="yyyy/mm/dd"
                    name="ExpirationDate"
                    type="date"
                    onChange={() => handleChange("ExpirationDate")}
                    defaultValue={values1.ExpirationDate}
                  />
                </div>
                <label className="label">ÙØ¯ÛØ± ÙØ³ØªÙÛÙ</label>
                <div>
                  <MyTextField
                    style={{ width: "60%" }}
                    placeholder="Ø§ÙÛØ± Ø§Ø³Ø¯Û"
                    name="DirectManager"
                    type="input"
                    onChange={() => handleChange("DirectManager")}
                    defaultValue={values1.DirectManager}
                  />
                </div>
                <label className="label">HRBP</label>
                <div>
                  <MyTextField
                    style={{ width: "60%" }}
                    placeholder="ppb"
                    name="HRBP"
                    type="input"
                    defaultValue={values1.HRBP}
                    onChange={() => handleChange("HRBP")}
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
