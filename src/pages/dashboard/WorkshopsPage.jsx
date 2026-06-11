import EntityManager from "../../components/dashboard/EntityManager";
import { DashInput, DashTextarea } from "../../components/dashboard/DashInput";
import ImageUpload from "../../components/dashboard/ImageUpload";
import { CLOUDINARY_FOLDERS } from "../../lib/cloudinary";
import { useConference } from "../../hooks/useConference";
import { workshopToRow } from "../../lib/mappers";

const empty = () => ({
  number: 1,
  title: "",
  subtitle: "",
  description: "",
  facilitator: { name: "", credentials: "" },
  objectives: [],
  duration: "2:00",
  price: 300,
  currency: "DH",
  image: "",
});

export default function WorkshopsPage() {
  const { workshops } = useConference();

  return (
    <EntityManager
      title="Workshops"
      subtitle="Practical workshop sessions and registration"
      table="workshops"
      items={workshops}
      emptyLabel="No workshops yet."
      toRow={workshopToRow}
      getInitialForm={empty}
      columns={[
        { key: "number", label: "#" },
        { key: "title", label: "Title" },
        {
          key: "price",
          label: "Price",
          render: (w) => `${w.price} ${w.currency}`,
        },
      ]}
      renderForm={(form, setForm) => (
        <>
          <div className="grid sm:grid-cols-3 gap-4">
            <DashInput
              label="Number"
              type="number"
              value={form.number}
              onChange={(e) => setForm({ ...form, number: Number(e.target.value) })}
            />
            <DashInput
              label="Duration"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
            />
            <DashInput
              label="Price"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
          </div>
          <DashInput
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <DashInput
            label="Subtitle"
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          />
          <DashTextarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <DashInput
            label="Facilitator name"
            value={form.facilitator?.name ?? ""}
            onChange={(e) =>
              setForm({ ...form, facilitator: { ...form.facilitator, name: e.target.value } })
            }
          />
          <DashInput
            label="Facilitator credentials"
            value={form.facilitator?.credentials ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                facilitator: { ...form.facilitator, credentials: e.target.value },
              })
            }
          />
          <DashTextarea
            label="Objectives (one per line)"
            value={(form.objectives ?? []).join("\n")}
            onChange={(e) =>
              setForm({
                ...form,
                objectives: e.target.value.split("\n").filter(Boolean),
              })
            }
          />
          <ImageUpload
            label="Workshop banner"
            value={form.image}
            onChange={(url) => setForm({ ...form, image: url })}
            folder={CLOUDINARY_FOLDERS.workshops}
          />
        </>
      )}
    />
  );
}
