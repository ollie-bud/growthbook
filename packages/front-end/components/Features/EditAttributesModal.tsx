import { useFieldArray, useForm } from "react-hook-form";
import { SDKAttributeSchema } from "back-end/types/organization";
import { useAuth } from "../../services/auth";
import Modal from "../Modal";
import { useUser } from "../../services/UserContext";
import Toggle from "../Forms/Toggle";
import Field from "../Forms/Field";
import Tooltip from "../Tooltip/Tooltip";
import { FaQuestionCircle } from "react-icons/fa";
import track from "../../services/track";
import { useAttributeSchema } from "../../services/features";
import useOrgSettings from "../../hooks/useOrgSettings";
import { DocLink } from "../DocLink";

export default function EditAttributesModal({ close }: { close: () => void }) {
  const { refreshOrganization } = useUser();
  const settings = useOrgSettings();
  const { apiCall } = useAuth();

  const form = useForm<{ attributeSchema: SDKAttributeSchema }>({
    defaultValues: {
      attributeSchema: useAttributeSchema(),
    },
  });

  const attributeSchema = useFieldArray({
    control: form.control,
    name: "attributeSchema",
  });

  return (
    <Modal
      close={close}
      header="Edit Targeting Attributes"
      open={true}
      size="lg"
      cta="Save Attributes"
      submit={form.handleSubmit(async (value) => {
        if (!settings?.attributeSchema) {
          track("Save Targeting Attributes", {
            source: "onboarding",
            hashAttributes: value.attributeSchema
              .filter((s) => s.hashAttribute)
              .map((s) => s.property),
          });
        }

        await apiCall(`/organization`, {
          method: "PUT",
          body: JSON.stringify({
            settings: value,
          }),
        });
        await refreshOrganization();
      })}
    >
      <p>
        The Attributes you define here can be used to create advanced targeting
        rules for features and to run experiments.
      </p>
      {!settings?.attributeSchema?.length && (
        <p>
          We&apos;ve started you off with some common attributes, but feel free
          to modify the list as needed.
        </p>
      )}
      <div className="form-inline">
        <div className="pb-2 d-flex align-items-center">
          <Toggle
            value={attributeSchema.fields.some(
              (attribute) => attribute.property === "current_datetime"
            )}
            setValue={() => {
              if (
                !attributeSchema.fields.some(
                  (attribute) => attribute.property === "current_datetime"
                )
              ) {
                attributeSchema.append({
                  property: "current_datetime",
                  datatype: "date",
                });
              } else {
                attributeSchema.remove(
                  attributeSchema.fields.findIndex(
                    (attribute) => attribute.property === "current_datetime"
                  )
                );
              }
            }}
            id="full-stats"
            label="Show Full Stats"
          />
          Enable date-based feature rules
          <DocLink className="pl-1" docSection={"targeting_attributes"}>
            View Docs
          </DocLink>
        </div>
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Attribute</th>
              <th>Data Type</th>
              <th>
                Identifier{" "}
                <Tooltip body="Any attribute that uniquely identifies a user, account, device, or similar.">
                  <FaQuestionCircle />
                </Tooltip>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {attributeSchema.fields.map((v, i) => (
              <tr key={i}>
                <td>
                  <input
                    {...form.register(`attributeSchema.${i}.property`)}
                    placeholder="Property Name"
                    className="form-control"
                    required
                  />
                </td>
                <td>
                  <select
                    {...form.register(`attributeSchema.${i}.datatype`)}
                    className="form-control"
                  >
                    <option value="boolean">Boolean</option>
                    <option value="number">Number</option>
                    <option value="string">String</option>
                    <option value="enum">Enum</option>
                    <option value="number[]">Array of Numbers</option>
                    <option value="string[]">Array of Strings</option>
                    <option value="date">Date</option>
                  </select>
                  {form.watch(`attributeSchema.${i}.datatype`) === "enum" && (
                    <div>
                      <Field
                        textarea
                        minRows={1}
                        required
                        {...form.register(`attributeSchema.${i}.enum`)}
                        placeholder="Comma-separated list of all possible values"
                      />
                    </div>
                  )}
                </td>
                <td>
                  {v.datatype !== "date" && (
                    <Toggle
                      id={"toggle" + i}
                      label="Identifier"
                      value={!!form.watch(`attributeSchema.${i}.hashAttribute`)}
                      setValue={(value) => {
                        form.setValue(
                          `attributeSchema.${i}.hashAttribute`,
                          value
                        );
                      }}
                    />
                  )}
                </td>
                <td>
                  <button
                    className="btn btn-link text-danger close"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      attributeSchema.remove(i);
                    }}
                  >
                    x
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <a
          href="#"
          className="btn btn-outline-primary"
          onClick={(e) => {
            e.preventDefault();
            attributeSchema.append({
              property: "",
              datatype: "string",
            });
          }}
        >
          add attribute
        </a>
      </div>
    </Modal>
  );
}
