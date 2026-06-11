import { useState } from "react";
import { HiOutlinePencilSquare, HiOutlineTrash, HiOutlinePlus } from "react-icons/hi2";
import DashButton from "./DashButton";
import DashModal from "./DashModal";
import { createRow, updateRow, deleteRow } from "../../lib/contentApi";
import { isPersistedId } from "../../lib/ids";
import { useConference } from "../../hooks/useConference";

export default function EntityManager({
  title,
  subtitle,
  table,
  columns,
  items,
  emptyLabel,
  toRow,
  renderForm,
  getInitialForm,
}) {
  const { refresh } = useConference();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(getInitialForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const openCreate = () => {
    setEditing(null);
    setForm(getInitialForm());
    setError("");
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm(item);
    setError("");
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const row = toRow(form, items.length);
      const { sort_order: _sort, ...updates } = row;

      if (editing?.id && isPersistedId(editing.id)) {
        await updateRow(table, editing.id, updates);
      } else {
        await createRow(table, row);
      }
      await refresh();
      setModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!isPersistedId(id)) return;
    if (!window.confirm("Delete this item?")) return;
    try {
      await deleteRow(table, id);
      await refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dash-text">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-dash-muted">{subtitle}</p>}
        </div>
        <DashButton onClick={openCreate}>
          <HiOutlinePlus className="w-4 h-4" />
          Add new
        </DashButton>
      </div>

      <div className="dash-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dash-border bg-dash-bg/60">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dash-muted"
                  >
                    {col.label}
                  </th>
                ))}
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-dash-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-5 py-12 text-center text-dash-muted"
                  >
                    {emptyLabel}
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-dash-border last:border-0 hover:bg-blue-50/40 transition-colors duration-200"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-5 py-4 text-dash-text">
                        {col.render ? col.render(item) : item[col.key]}
                      </td>
                    ))}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="p-2 rounded-lg text-dash-muted hover:bg-blue-50 hover:text-dash-primary transition-colors duration-200 cursor-pointer dash-focus-ring"
                          aria-label="Edit"
                        >
                          <HiOutlinePencilSquare className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-2 rounded-lg text-dash-muted hover:bg-red-50 hover:text-red-600 transition-colors duration-200 cursor-pointer dash-focus-ring"
                          aria-label="Delete"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DashModal
        title={editing ? `Edit ${title}` : `Add ${title}`}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        wide
      >
        <form onSubmit={handleSave} className="space-y-4">
          {renderForm(form, setForm)}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <DashButton variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </DashButton>
            <DashButton type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </DashButton>
          </div>
        </form>
      </DashModal>
    </div>
  );
}
