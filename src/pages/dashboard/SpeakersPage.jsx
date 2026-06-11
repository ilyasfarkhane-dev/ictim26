import EntityManager from "../../components/dashboard/EntityManager";
import { DashInput, DashTextarea } from "../../components/dashboard/DashInput";
import ImageUpload from "../../components/dashboard/ImageUpload";
import { CLOUDINARY_FOLDERS } from "../../lib/cloudinary";
import { useConference } from "../../hooks/useConference";
import { speakerToRow } from "../../lib/mappers";

const empty = () => ({
  name: "",
  position: "",
  company: "",
  bio: "",
  image: "",
});

export default function SpeakersPage() {
  const { speakers } = useConference();

  return (
    <EntityManager
      title="Speakers"
      subtitle="Manage keynote speakers and presenters"
      table="speakers"
      items={speakers}
      emptyLabel="No speakers yet. Add your first speaker."
      toRow={speakerToRow}
      getInitialForm={empty}
      columns={[
        { key: "name", label: "Name" },
        { key: "position", label: "Position" },
        {
          key: "company",
          label: "Affiliation",
          render: (s) => <span className="line-clamp-1 max-w-xs">{s.company}</span>,
        },
      ]}
      renderForm={(form, setForm) => (
        <>
          <DashInput
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <DashInput
            label="Position"
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
          />
          <DashInput
            label="Affiliation"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
          <ImageUpload
            label="Photo"
            value={form.image}
            onChange={(url) => setForm({ ...form, image: url })}
            folder={CLOUDINARY_FOLDERS.speakers}
            required
          />
          <DashTextarea
            label="Bio"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </>
      )}
    />
  );
}
