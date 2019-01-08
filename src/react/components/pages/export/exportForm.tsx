import React from "react";
import Form, { FormValidation, IChangeEvent, ISubmitEvent, Widget } from "react-jsonschema-form";
import { addLocValues, strings } from "../../../../common/strings";
import { IExportFormat } from "../../../../models/applicationState.js";
import CustomFieldTemplate from "../../common/customField/customFieldTemplate";
import ExternalPicker from "../../common/externalPicker/externalPicker";
// tslint:disable-next-line:no-var-requires
const formSchema = addLocValues(require("./exportForm.json"));
// tslint:disable-next-line:no-var-requires
const uiSchema = addLocValues(require("./exportForm.ui.json"));

export interface IExportFormProps extends React.Props<ExportForm> {
    settings: IExportFormat;
    onSubmit: (exportFormat: IExportFormat) => void;
    onCancel?: () => void;
}

export interface IExportFormState {
    classNames: string[];
    providerName: string;
    formSchema: any;
    uiSchema: any;
    formData: IExportFormat;
}

export default class ExportForm extends React.Component<IExportFormProps, IExportFormState> {
    private widgets = {
        externalPicker: (ExternalPicker as any) as Widget,
    };

    constructor(props, context) {
        super(props, context);

        this.state = {
            classNames: ["needs-validation"],
            providerName: this.props.settings ? this.props.settings.providerType : null,
            formSchema: { ...formSchema },
            uiSchema: { ...uiSchema },
            formData: this.props.settings,
        };

        if (this.props.settings) {
            this.bindForm(this.props.settings);
        }

        this.onFormSubmit = this.onFormSubmit.bind(this);
        this.onFormValidate = this.onFormValidate.bind(this);
        this.onFormChange = this.onFormChange.bind(this);
        this.onFormCancel = this.onFormCancel.bind(this);
    }

    public componentDidUpdate(prevProps: IExportFormProps) {
        if (prevProps.settings !== this.props.settings) {
            this.bindForm(this.props.settings);
        }
    }

    public render() {
        return (
            <Form
                className={this.state.classNames.join(" ")}
                showErrorList={false}
                liveValidate={true}
                noHtml5Validate={true}
                FieldTemplate={CustomFieldTemplate}
                validate={this.onFormValidate}
                widgets={this.widgets}
                formContext={this.state.formData}
                schema={this.state.formSchema}
                uiSchema={this.state.uiSchema}
                formData={this.state.formData}
                onChange={this.onFormChange}
                onSubmit={this.onFormSubmit}>
                <div>
                    <button className="btn btn-success mr-1" type="submit">{strings.export.saveSettings}</button>
                    <button className="btn btn-secondary btn-cancel"
                        type="button"
                        onClick={this.onFormCancel}>{strings.common.cancel}</button>
                </div>
            </Form>
        );
    }

    private onFormChange = (args: IChangeEvent<IExportFormat>) => {
        const providerType = args.formData.providerType;

        if (providerType !== this.state.providerName) {
            this.bindForm(args.formData, true);
        } else {
            this.setState({ formData: { ...args.formData } });
        }
    }

    private onFormValidate(exportFormat: IExportFormat, errors: FormValidation) {
        if (this.state.classNames.indexOf("was-validated") === -1) {
            this.setState({
                classNames: [...this.state.classNames, "was-validated"],
            });
        }

        return errors;
    }

    private onFormSubmit = (args: ISubmitEvent<IExportFormat>) => {
        this.props.onSubmit(args.formData);
    }

    private onFormCancel() {
        if (this.props.onCancel) {
            this.props.onCancel();
        }
    }

    private bindForm(exportFormat: IExportFormat, resetProviderOptions: boolean = false) {
        const providerType = exportFormat ? exportFormat.providerType : null;
        let newFormSchema: any = this.state.formSchema;
        let newUiSchema: any = this.state.uiSchema;

        if (providerType) {
            const providerSchema = addLocValues(require(`../../../../providers/export/${providerType}.json`));
            const providerUiSchema = require(`../../../../providers/export/${providerType}.ui.json`);

            newFormSchema = { ...formSchema };
            newFormSchema.properties["providerOptions"] = providerSchema;

            newUiSchema = { ...uiSchema };
            newUiSchema["providerOptions"] = providerUiSchema;
        }

        const formData = { ...exportFormat };
        if (resetProviderOptions) {
            formData.providerOptions = {};
        }

        this.setState({
            providerName: providerType,
            formSchema: newFormSchema,
            uiSchema: newUiSchema,
            formData,
        });
    }
}
