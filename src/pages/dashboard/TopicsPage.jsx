import EntityManager from "../../components/dashboard/EntityManager";
import { DashInput } from "../../components/dashboard/DashInput";
import { useConference } from "../../hooks/useConference";
import { topicToRow } from "../../lib/mappers";

export default function TopicsPage() {
  const { topics } = useConference();

  return (
    <EntityManager
      title="Research Topics"
      subtitle="Conference submission areas"
      table="topics"
      items={topics}
      emptyLabel="No topics yet."
      toRow={topicToRow}
      getInitialForm={() => ({ name: "" })}
      columns={[{ key: "name", label: "Topic" }]}
      renderForm={(form, setForm) => (
        <DashInput
          label="Topic name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      )}
    />
  );
}
