import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Pencil,
  Phone,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import {
  addEmergencyContact,
  deleteEmergencyContact,
  fetchEmergencyContacts,
  updateEmergencyContact,
} from "../../services/dataService";

const emptyForm = {
  name: "",
  relationship: "",
  phone: "",
  priority: "1",
};

function EmergencyContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [deleteContactId, setDeleteContactId] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadContacts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchEmergencyContacts();

        if (!mounted) {
          return;
        }

        setContacts(data || []);
      } catch (err) {
        if (mounted) {
          setError("Unable to load emergency contacts right now.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadContacts();

    return () => {
      mounted = false;
    };
  }, []);

  const openAddModal = () => {
    setEditingContact(null);
    setFormData(emptyForm);
    setFormError("");
    setShowForm(true);
  };

  const openEditModal = (contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      priority: String(contact.priority || 1),
    });
    setFormError("");
    setShowForm(true);
  };

  const closeFormModal = () => {
    setShowForm(false);
    setEditingContact(null);
    setFormData(emptyForm);
    setFormError("");
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSaveContact = async (event) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.relationship.trim() || !formData.phone.trim()) {
      setFormError("Please complete all required fields.");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      relationship: formData.relationship.trim(),
      phone: formData.phone.trim(),
      priority: Number(formData.priority) || 1,
    };

    try {
      if (editingContact) {
        const updated = await updateEmergencyContact(editingContact.id, payload);
        setContacts((current) =>
          current.map((contact) => (contact.id === updated.id ? { ...contact, ...updated } : contact))
        );
      } else {
        const created = await addEmergencyContact(payload);
        setContacts((current) => [created, ...current]);
      }

      closeFormModal();
    } catch (err) {
      setFormError("Unable to save this contact right now.");
    }
  };

  const handleDeleteContact = async () => {
    if (!deleteContactId) {
      return;
    }

    try {
      await deleteEmergencyContact(deleteContactId);
      setContacts((current) => current.filter((contact) => contact.id !== deleteContactId));
      setDeleteContactId(null);
    } catch (err) {
      setError("Unable to delete this contact right now.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 text-slate-600">
            <div className="h-5 w-5 animate-pulse rounded-full bg-slate-300" />
            <span className="text-sm font-medium">Loading contacts...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <div className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Emergency Contacts</h1>
          <p className="mt-1 text-sm text-slate-600">
            View and manage the trusted contacts for emergency assistance.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Registered Contacts</div>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">Trusted contacts</h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {contacts.length} total
              </span>
              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                Add Contact
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {contacts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                <div className="text-lg font-semibold text-slate-900">No emergency contacts added</div>
                <p className="mt-2 text-sm text-slate-600">
                  Add a trusted contact so they can be notified during an emergency.
                </p>
                <button
                  type="button"
                  onClick={openAddModal}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <Plus className="h-4 w-4" />
                  Add Contact
                </button>
              </div>
            ) : (
              contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-lg font-semibold text-slate-900">{contact.name}</div>
                      <div className="mt-1 text-sm text-slate-600">{contact.relationship}</div>
                    </div>

                    <div className="flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-700">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Priority {contact.priority}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Phone className="h-4 w-4 text-slate-500" />
                      <span>{contact.phone}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(contact)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteContactId(contact.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900">
                {editingContact ? "Edit Contact" : "Add Contact"}
              </h3>
              <button
                type="button"
                onClick={closeFormModal}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close contact form"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleSaveContact}>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Enter full name"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Relationship</label>
                <input
                  type="text"
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleFormChange}
                  placeholder="Enter relationship"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  placeholder="Enter phone number"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="1">Priority 1</option>
                  <option value="2">Priority 2</option>
                  <option value="3">Priority 3</option>
                </select>
              </div>

              {formError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteContactId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Delete Emergency Contact?</h3>
                <p className="mt-1 text-sm text-slate-600">Are you sure you want to remove this contact?</p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteContactId(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteContact}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmergencyContactsPage;
