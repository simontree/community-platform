import * as React from "react";
import { RouteComponentProps } from "react-router";
import { Form, Field } from "react-final-form";
import { FieldArray } from "react-final-form-arrays";
import arrayMutators from "final-form-arrays";
import "./CreateTutorial.scss";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import SaveIcon from "@material-ui/icons/Save";
import { ITutorialStep } from "../../../../models/tutorial.models";

import { db } from "../../../../utils/firebase";

import { storage } from "../../../../utils/firebase";
import FileUploader from "react-firebase-file-uploader";
import { NavLink } from "react-router-dom";

export interface IState {
  formValues: IFormValues;
  _isUploading: boolean;
  _imgUploadProgress: number;
  _uploadPath: string;
  _currentStepIndex: number;
}
interface IFormValues {
  workspace_name: string;
  tutorial_title: string;
  tutorial_description: string;
  tutorial_time: number;
  tutorial_cost: number;
  difficulty_level: string;
  id: string;
  slug: string;
  steps: ITutorialStep[];
  cover_image_url: string;
  cover_image_filename: string;
  tutorial_files_url: string;
}

const styles = {
  card: {
    minWidth: 275,
    maxWidth: 600,
    margin: "20px auto"
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)"
  },
  title: {
    fontSize: 14
  },
  pos: {
    marginBottom: 12
  },
  uploadBtn: {
    backgroundColor: "steelblue",
    color: "white",
    padding: 10,
    borderRadius: 4,
    cursor: "pointer"
  }
};

const required = (value: any) => (value ? undefined : "Required");

class CreateTutorial extends React.PureComponent<
  RouteComponentProps<any>,
  IState
> {
  constructor(props: any) {
    super(props);
    this.state = {
      formValues: {
        tutorial_description: "this is test description",
        tutorial_title: "my tutorial yolo title",
        tutorial_time: 20,
        tutorial_cost: 50,
        difficulty_level: "easy",
        cover_image_url: "",
        tutorial_files_url: "",
        id: "",
        slug: "",
        steps: [
          {
            title: "step 1",
            text: "step 1 description",
            images: []
          },
          {
            title: "step 2",
            text: "step 2 description",
            images: []
          },
          {
            title: "step 3",
            text: "step 3 description",
            images: []
          }
        ],
        workspace_name: "test",
        cover_image_filename: ""
      },
      _isUploading: false,
      _imgUploadProgress: 0,
      _uploadPath: "uploads/test",
      _currentStepIndex: 0
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.preparePayload = this.preparePayload.bind(this);
  }

  public preparePayload = (values: any) => {
    console.log("values", values);
  };

  public onSubmit = async (values: any) => {
    console.log("submitting", values);
    // try {
    //   await db.doc("tutorials/testdocdave").set({
    //     values
    //   });
    //   console.log("doc set successfully");
    // } catch (error) {
    //   console.log("error while saving the tutorial");
    // }
  };

  public handleUploadStart = () => {
    this.setState({ _isUploading: true, _imgUploadProgress: 0 });
  };
  public handleProgress = (imgUploadProgress: any) => {
    this.setState({ _imgUploadProgress: imgUploadProgress });
  };
  public handleUploadError = (error: any) => {
    this.setState({ _isUploading: false });
    console.error(error);
  };
  public handleUploadCoverSuccess = (filename: string) => {
    this.setState({
      _imgUploadProgress: 100,
      _isUploading: false
    });
    storage
      .ref(this.state._uploadPath)
      .child(filename)
      .getDownloadURL()
      .then(url => {
        this.setState({
          formValues: { ...this.state.formValues, cover_image_url: url }
        });
      });
  };
  /* EXAMPLE
    You want to pass the step index to the handle upload step image success function
    When you have the url of the image you want to merge it with the existing step images
    Then merge the updated step with all steps and update the state
  */
  public handleUploadStepImgSuccess = async (filename: any) => {
    console.log("index", this.state._currentStepIndex);

    // untested code for reference - get the current steps
    const currentSteps: any = this.state.formValues.steps;
    // get the step at the index where the new image will go
    const url = await storage
      .ref(this.state._uploadPath)
      .child(filename)
      .getDownloadURL();
    // use the spread operator to merge the existing images with the new url
    // it should create a new array if one doesn't already exist
    currentSteps[this.state._currentStepIndex].images = [
      ...currentSteps[this.state._currentStepIndex].images,
      url
    ];
    this.setState({
      // additional meta fields if desired
      formValues: { ...this.state.formValues, steps: currentSteps },
      _imgUploadProgress: 100,
      _isUploading: false
    });
    console.log("this.state.formValues", this.state.formValues);
  };
  public handleUploadFilesSuccess = (filename: string) => {
    this.setState({
      _imgUploadProgress: 100,
      _isUploading: false
    });
    storage
      .ref(this.state._uploadPath)
      .child(filename)
      .getDownloadURL()
      .then(url => {
        this.setState({
          formValues: { ...this.state.formValues, tutorial_files_url: url }
        });
      });
  };

  public onChangeHandlerStepImg = (event: any) => {
    const {
      target: { files }
    } = event;
    const filesToStore: any = [];
    console.log("files :", files);
    for (const f of files) {
      console.log("f :", f);
      filesToStore.push(f);
    }
    // this.setState({ _stepsImgUrl: filesToStore });
  };

  public onTitleChange = (event: any) => {
    // *** TODO the event.target.value needs to be formated as the article id
    this.setState({ _uploadPath: "uploads/" + event.target.value });
  };

  public displayStepImgUpload = (stepIndex: any) => {
    return (
      <FileUploader
        accept="image/*"
        name={"step" + stepIndex + "_image"}
        storageRef={storage.ref(this.state._uploadPath)}
        onUploadStart={this.handleUploadStart}
        onUploadError={this.handleUploadError}
        onUploadSuccess={this.handleUploadStepImgSuccess}
        onProgress={this.handleProgress}
      />
    );
  };

  public render() {
    return (
      <Form
        onSubmit={this.onSubmit}
        initialValues={this.state.formValues}
        mutators={{
          ...arrayMutators
        }}
        render={({
          handleSubmit,
          mutators: { push, pop }, // injected from final-form-arrays above
          pristine,
          reset,
          submitting,
          values
        }) => {
          return (
            <form className="tutorial-form" onSubmit={handleSubmit}>
              <Typography variant="h4" component="h4">
                Create documentation
              </Typography>
              <div>
                <Card style={styles.card}>
                  <CardContent>
                    <Typography variant="h5" component="h2">
                      Covers details
                    </Typography>
                    <Typography component="label">
                      What is your davehakkens.nl account ?
                    </Typography>
                    <Field
                      name="workspace_name"
                      validate={required}
                      placeholder="Workspace Name"
                      component="input"
                    />
                    <Typography component="label">
                      What is the title of your documentation ?
                    </Typography>
                    <Field name="tutorial_title" validate={required}>
                      {({ input, meta }) => (
                        <div>
                          <input
                            {...input}
                            type="text"
                            onBlur={this.onTitleChange}
                            placeholder="Tutorial title"
                          />
                          {meta.error &&
                            meta.touched && <span>{meta.error}</span>}
                        </div>
                      )}
                    </Field>
                    <Typography component="label">
                      Upload a cover image
                    </Typography>
                    {this.state._isUploading && (
                      <p>Progress: {this.state._imgUploadProgress}</p>
                    )}
                    {this.state.formValues.cover_image_url && (
                      <img
                        className="cover-img"
                        src={this.state.formValues.cover_image_url}
                        alt={
                          "cover image - " +
                          this.state.formValues.tutorial_title
                        }
                      />
                    )}
                    <label style={styles.uploadBtn}>
                      <FileUploader
                        hidden
                        accept="image/png, image/jpeg"
                        name="coverImg"
                        storageRef={storage.ref(this.state._uploadPath)}
                        onUploadStart={this.handleUploadStart}
                        onUploadError={this.handleUploadError}
                        onUploadSuccess={this.handleUploadCoverSuccess}
                        onProgress={this.handleProgress}
                      />
                      Upload
                      <span className="iconSeparator">
                        <CloudUploadIcon />
                      </span>
                    </label>
                    <Field
                      name="tutorial_description"
                      validate={required}
                      placeholder="Quick tutorial description"
                    >
                      {({ input, meta }) => (
                        <div>
                          <Typography component="label">
                            Write a short description for the documentation
                          </Typography>
                          <textarea
                            {...input}
                            placeholder="Tutorial description"
                          />
                          {meta.error &&
                            meta.touched && <span>{meta.error}</span>}
                        </div>
                      )}
                    </Field>
                    <Field name="tutorial_time" validate={required}>
                      {({ input, meta }) => (
                        <div>
                          <Typography component="label">
                            How much time does it take ?
                          </Typography>
                          <input
                            {...input}
                            type="text"
                            placeholder="Time needed"
                          />
                          {meta.error &&
                            meta.touched && <span>{meta.error}</span>}
                        </div>
                      )}
                    </Field>
                    <Field name="tutorial_cost" validate={required}>
                      {({ input, meta }) => (
                        <div>
                          <Typography component="label">
                            How much does it take ?
                          </Typography>
                          <input
                            {...input}
                            type="text"
                            placeholder="The cost ? in $"
                          />
                          {meta.error &&
                            meta.touched && <span>{meta.error}</span>}
                        </div>
                      )}
                    </Field>
                    <Typography component="label">
                      How difficult to replicate is your documentation ?
                    </Typography>
                    <Field name="difficulty" component="select">
                      <option value="easy">easy</option>
                      <option value="medium">medium</option>
                      <option value="difficult">difficult</option>
                    </Field>
                    <Typography component="label">
                      Are there any file(s) to support your documentation ?
                    </Typography>
                    <label style={styles.uploadBtn}>
                      <FileUploader
                        hidden
                        multiple={true}
                        name="files"
                        storageRef={storage.ref(this.state._uploadPath)}
                        onUploadStart={this.handleUploadStart}
                        onUploadError={this.handleUploadError}
                        onUploadSuccess={this.handleUploadFilesSuccess}
                        onProgress={this.handleProgress}
                      />
                      Upload
                      <span className="iconSeparator">
                        <CloudUploadIcon />
                      </span>
                    </label>
                  </CardContent>
                </Card>
              </div>

              <div />

              <FieldArray name="steps">
                {({ fields }) =>
                  fields.map((step, index) => (
                    <Card key={step} style={styles.card}>
                      <CardContent>
                        {this.state.formValues.steps[index] && (
                          <div>
                            <Typography variant="h5" component="h2">
                              Step {index + 1} -{" "}
                              {this.state.formValues.steps[index].title}
                            </Typography>
                            <Typography component="label">
                              Pick a title for this step
                            </Typography>
                            <Field
                              name={"step_" + index + 1 + "_title"}
                              component="input"
                              placeholder="Step title"
                              validate={required}
                            />
                            <Typography component="label">
                              Describe this step
                            </Typography>
                            <Field
                              name={"step_" + index + 1 + "_description"}
                              component="textarea"
                              placeholder="Description"
                              validate={required}
                            />
                          </div>
                        )}
                        <span
                          onClick={() => fields.remove(index)}
                          style={{ cursor: "pointer" }}
                        >
                          ❌
                        </span>

                        {this.state.formValues.steps[index] &&
                          this.state.formValues.steps[index].images.length >=
                            1 &&
                          this.state.formValues.steps[index].images.map(
                            (stepImg, stepImgindex) => (
                              <img
                                key={stepImgindex}
                                className="step-img"
                                src={stepImg}
                              />
                            )
                          )}
                        <Typography component="label">
                          Upload picture(s) about this specific step
                        </Typography>
                        <label style={styles.uploadBtn}>
                          <FileUploader
                            hidden
                            name="stepImages"
                            storageRef={storage.ref(this.state._uploadPath)}
                            onUploadStart={this.handleUploadStart}
                            onUploadError={this.handleUploadError}
                            onUploadSuccess={this.handleUploadStepImgSuccess}
                            onProgress={this.handleProgress}
                            onClick={() => {
                              this.setState({ _currentStepIndex: index });
                            }}
                          />
                          Upload
                          <span className="iconSeparator">
                            <CloudUploadIcon />
                          </span>
                        </label>
                      </CardContent>
                    </Card>
                  ))
                }
              </FieldArray>
              {/* <div className="buttons">
                <button
                  type="button"
                  onClick={() => {
                    // const emptyStep: any = {
                    //   ...this.state.formValues.steps,
                    //   title: "",
                    //   text: "",
                    //   images: []
                    // };
                    // this.setState({
                    //   formValues: { ...this.state.formValues, steps: emptyStep }
                    // });
                    push("steps", undefined);
                  }}
                >
                  Add Step
                </button>
                
              </div> */}

              <Card style={styles.card}>
                <CardContent>
                  <Button
                    color="primary"
                    onClick={() => {
                      // const emptyStep: any = {
                      //   ...this.state.formValues.steps,
                      //   title: "",
                      //   text: "",
                      //   images: []
                      // };
                      // this.setState({
                      //   formValues: { ...this.state.formValues, steps: emptyStep }
                      // });
                      push("steps", undefined);
                    }}
                    variant="outlined"
                  >
                    Add step
                  </Button>
                  <Button type="button" onClick={() => pop("steps")}>
                    Remove Step
                  </Button>
                </CardContent>
              </Card>
              <Button
                color="primary"
                variant="outlined"
                type="submit"
                disabled={submitting || pristine}
              >
                Save
                <SaveIcon />
              </Button>
              {/* <div className="buttons">
                <button type="submit" disabled={submitting || pristine}>
                  Submit
                </button>
              </div> */}
            </form>
          );
        }}
      />
    );
  }
}

export default CreateTutorial;
