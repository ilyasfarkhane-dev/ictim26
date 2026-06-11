import EntityManager from "../../components/dashboard/EntityManager";
import { DashInput } from "../../components/dashboard/DashInput";
import ImageUpload from "../../components/dashboard/ImageUpload";
import { CLOUDINARY_FOLDERS } from "../../lib/cloudinary";
import { useConference } from "../../hooks/useConference";
import { sponsorToRow } from "../../lib/mappers";

export default function SponsorsPage() {
  const { partners } = useConference();

  return (
    <EntityManager
      title="Sponsors & Partners"
      subtitle="Partner logos displayed on the website"
      table="sponsors"
      items={partners}
      emptyLabel="No sponsors yet."
      toRow={sponsorToRow}
      getInitialForm={() => ({ name: "", logo: "" })}
      columns={[
        { key: "name", label: "Name" },
        {
          key: "logo",
          label: "Logo",
          render: (s) =>
            s.logo ? (
              <img src={s.logo} alt={s.name} className="h-6 object-contain" />
            ) : (
              "—"
            ),
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
          <ImageUpload
            label="Partner logo"
            value={form.logo}
            onChange={(url) => setForm({ ...form, logo: url })}
            folder={CLOUDINARY_FOLDERS.sponsors}
            previewClassName="h-16 w-auto max-w-full object-contain rounded-xl bg-dash-bg p-2"
          />
        </>
      )}
    />
  );
}
