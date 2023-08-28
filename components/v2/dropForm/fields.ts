export interface FieldProps {
  [key: string]: {
    enabledBy?: string;
    superficial?: boolean;
    toggle?: {
      label: string;
      type: "checkbox";
      value: boolean;
    };
    field: {
      required?: boolean;
      label: string;
      type:
        | "text"
        | "checkbox"
        | "number"
        | "datetime-local"
        | "textarea"
        | "text-arr";
      placeholder?: string | number;
      pattern?: string;
      disabled?: boolean;
      inlineMessage?: string;
      validateAs?: "string" | "url" | "json" | "number" | "path" | "address";
      value: string | number | boolean | string[] | boolean;
      helper?: string;
      error?: boolean;
      errorMessage?: string;
    };
  };
}

export const fields: FieldProps = {
  name: {
    field: {
      required: true,
      label: "Name",
      type: "text",
      value: "",
      validateAs: "string",
      errorMessage: "Drop name is required",
    },
  },
  description: {
    field: {
      required: true,
      label: "Description",
      placeholder: "Add a descriiption of your drop",
      type: "text",
      validateAs: "string",
      value: "",
      errorMessage: "Drop description is required",
    },
  },
  image: {
    field: {
      required: false,
      label: "Image",
      placeholder: "Add a link to your image",
      type: "text",
      validateAs: "url",
      value: "",
      errorMessage: "Drop description is required",
    },
  },
  path: {
    field: {
      required: true,
      label: "Path",
      placeholder: "A path to your drop",
      // Disable spaces regex
      validateAs: "path",
      pattern: "^S+$",
      helper: "https://claim.disco.xyz/{value}",
      type: "text",
      value: "",
      errorMessage: "Drop path is required",
    },
  },
  // schema: {
  //   field: {
  //     required: true,
  //     label: "Path to your schema",
  //     placeholder: "https://raw.githubusercontent.com/.....",
  //     // Html regex
  //     pattern: "^(http(s)?://)+[w-._~:/?#[]@!$&'()*+,;=.]+$",
  //     validateAs: "url",
  //     type: "text",
  //     value: "",
  //     errorMessage: "Valid schema URL is required",
  //   },
  // },
  visible: {
    field: {
      required: false,
      label: "Show drop in drop feed?",
      helper: "If disabled, the drop will be accessible via the path",
      type: "checkbox",
      value: true,
    },
  },
  disabled: {
    field: {
      required: false,
      label: "Disable claims",
      type: "checkbox",
      value: false,
      helper: "Visitors will not be able to claim the credential",
    },
  },
  // limit: {
  //   toggle: {
  //     label: "Turn on claim limit",
  //     type: "checkbox",
  //     value: false,
  //   },
  //   field: {
  //     label: "The amount of addresses which may claim the credential",
  //     placeholder: "0",
  //     type: "number",
  //     validateAs: "number",
  //     value: 0,
  //     errorMessage: "A value must be provided when a limit is enabled",
  //   },
  // },
  // startTime: {
  //   toggle: {
  //     label: "Enable start time",
  //     type: "checkbox",
  //     value: false,
  //   },
  //   field: {
  //     label: "Add a start time (UTC)",
  //     placeholder: "",
  //     type: "datetime-local",
  //     value: "",
  //     errorMessage: "A start time must be provided when enabled",
  //   },
  // },
  // endTime: {
  //   toggle: {
  //     label: "Enable end time",
  //     type: "checkbox",
  //     value: false,
  //   },
  //   field: {
  //     label: "Add an end time (UTC)",
  //     placeholder: "",
  //     type: "datetime-local",
  //     value: "",
  //     errorMessage: "An end time must be provided when enabled",
  //   },
  // },
  claims: {
    toggle: {
      label: "Limit recipient addresses",
      type: "checkbox",
      value: false,
    },
    field: {
      label: "Add a comma-separated elibility list",
      placeholder: "",
      type: "text-arr",
      validateAs: "address",
      value: [""],
      errorMessage: "Recipients be provided when enabled",
    },
  },
};
