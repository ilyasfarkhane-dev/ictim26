import EntityManager from "../../components/dashboard/EntityManager";
import { DashInput, DashTextarea } from "../../components/dashboard/DashInput";
import ImageUpload from "../../components/dashboard/ImageUpload";
import { CLOUDINARY_FOLDERS } from "../../lib/cloudinary";
import { useConference } from "../../hooks/useConference";
import { dateToRow } from "../../lib/mappers";

const empty = () => ({
  step: "",
  title: "",
  date: "",
  description: "",
  icon: "calendar",
  image: "",
});

export default function DatesPage() {
  const { participationSteps } = useConference();

  return (
    <EntityManager
      title="Important Dates"
      subtitle="Submission timeline and conference milestones"
      table="important_dates"
      items={participationSteps}
      emptyLabel="No dates configured."
      toRow={dateToRow}
      getInitialForm={empty}
      columns={[
        { key: "step", label: "Step" },
        { key: "title", label: "Title" },
        { key: "date", label: "Date" },
      ]}
      renderForm={(form, setForm) => (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <DashInput
              label="Step"
              value={form.step}
              onChange={(e) => setForm({ ...form, step: e.target.value })}
              placeholder="01"
            />
            <DashInput
              label="Date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <DashInput
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <DashInput
            label="Icon key"
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            placeholder="calendar, document, check…"
          />
          <ImageUpload
            label="Step image"
            value={form.image}
            onChange={(url) => setForm({ ...form, image: url })}
            folder={CLOUDINARY_FOLDERS.dates}
          />
          <DashTextarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </>
      )}
    />
  );
}
