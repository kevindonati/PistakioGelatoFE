import { Edit, Search, Trash2, UserRound, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import { deleteUser, getUsers, type AdminUser } from "../../services/userApi"

function AdminCustomers() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<"ALL" | "USER" | "ADMIN">("ALL")
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "DISABLED"
  >("ALL")

  const size = 10

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError("")

      const data = await getUsers({
        page,
        size,
        orderBy: "name",
      })

      setUsers(data.content)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error(error)

      setError(t("admin.customers.loadError"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUsers()
  }, [page])

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        `${user.name} ${user.surname}`
          .toLowerCase()
          .includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch)

      const matchesRole = roleFilter === "ALL" || user.role === roleFilter

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && user.enabled) ||
        (statusFilter === "DISABLED" && !user.enabled)

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, search, roleFilter, statusFilter])

  const hasFilters =
    search.trim() !== "" || roleFilter !== "ALL" || statusFilter !== "ALL"

  const resetFilters = () => {
    setSearch("")
    setRoleFilter("ALL")
    setStatusFilter("ALL")
    setPage(0)
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(t("admin.customers.deleteConfirm"))

    if (!confirmed) {
      return
    }

    try {
      setError("")

      await deleteUser(id)

      if (users.length === 1 && page > 0) {
        setPage((current) => current - 1)
      } else {
        await loadUsers()
      }
    } catch (error) {
      console.error(error)

      setError(t("admin.customers.deleteError"))
    }
  }

  if (loading) {
    return <div className="text-center py-5">{t("common.loading")}</div>
  }

  return (
    <div>
      {/* HEADER */}

      <div className="mb-4">
        <h1 className="mb-1">{t("admin.customers.title")}</h1>

        <p className="text-muted mb-0">{t("admin.customers.subtitle")}</p>
      </div>

      {/* ERROR */}

      {error && <div className="alert alert-danger">{error}</div>}

      {/* FILTRI */}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            {/* RICERCA */}

            <div className="col-12 col-lg-5">
              <label className="form-label">
                {t("admin.customers.search")}
              </label>

              <div className="input-group">
                <span className="input-group-text bg-white">
                  <Search size={17} />
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder={t("admin.customers.searchPlaceholder")}
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value)
                    setPage(0)
                  }}
                />
              </div>
            </div>

            {/* RUOLO */}

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label">{t("admin.customers.role")}</label>

              <select
                className="form-select"
                value={roleFilter}
                onChange={(event) => {
                  setRoleFilter(event.target.value as "ALL" | "USER" | "ADMIN")
                  setPage(0)
                }}
              >
                <option value="ALL">{t("admin.customers.allRoles")}</option>

                <option value="USER">{t("admin.customers.user")}</option>

                <option value="ADMIN">{t("admin.customers.admin")}</option>
              </select>
            </div>

            {/* STATO */}

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label">
                {t("admin.customers.status")}
              </label>

              <select
                className="form-select"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(
                    event.target.value as "ALL" | "ACTIVE" | "DISABLED",
                  )
                  setPage(0)
                }}
              >
                <option value="ALL">{t("admin.customers.allStatuses")}</option>

                <option value="ACTIVE">{t("admin.customers.active")}</option>

                <option value="DISABLED">
                  {t("admin.customers.disabled")}
                </option>
              </select>
            </div>

            {/* RESET */}

            <div className="col-12 col-lg-1">
              {hasFilters && (
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100"
                  onClick={resetFilters}
                  title={t("admin.customers.resetFilters")}
                >
                  <X size={17} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RISULTATI */}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="text-muted small">
          {t("admin.customers.results", {
            count: filteredUsers.length,
          })}
        </span>
      </div>

      {/* TABELLA */}

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <UserRound size={42} className="mb-3" />

              <div>
                {t(
                  hasFilters
                    ? "admin.customers.noResults"
                    : "admin.customers.empty",
                )}
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>{t("admin.customers.customer")}</th>

                    <th>{t("admin.customers.email")}</th>

                    <th>{t("admin.customers.phone")}</th>

                    <th>{t("admin.customers.language")}</th>

                    <th>{t("admin.customers.role")}</th>

                    <th>{t("admin.customers.status")}</th>

                    <th className="text-end">{t("admin.customers.actions")}</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      {/* CLIENTE */}

                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="d-flex align-items-center justify-content-center rounded-circle bg-light"
                            style={{
                              width: 42,
                              height: 42,
                              flexShrink: 0,
                            }}
                          >
                            <UserRound size={19} className="text-muted" />
                          </div>

                          <div>
                            <div className="fw-semibold">
                              {user.name} {user.surname}
                            </div>

                            <div className="text-muted small">
                              {user.id.slice(0, 8)}
                              ...
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* EMAIL */}

                      <td>{user.email}</td>

                      {/* TELEFONO */}

                      <td>{user.phone || "—"}</td>

                      {/* LINGUA */}

                      <td>
                        <span className="badge text-bg-light">
                          {user.language}
                        </span>
                      </td>

                      {/* RUOLO */}

                      <td>
                        {user.role === "ADMIN" ? (
                          <span className="badge text-bg-dark">
                            {t("admin.customers.admin")}
                          </span>
                        ) : (
                          <span className="badge text-bg-light">
                            {t("admin.customers.user")}
                          </span>
                        )}
                      </td>

                      {/* STATO */}

                      <td>
                        {user.enabled ? (
                          <span className="badge text-bg-success">
                            {t("admin.customers.active")}
                          </span>
                        ) : (
                          <span className="badge text-bg-secondary">
                            {t("admin.customers.disabled")}
                          </span>
                        )}
                      </td>

                      {/* AZIONI */}

                      <td>
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            title={t("admin.customers.edit")}
                            onClick={() =>
                              navigate(`/admin/customers/${user.id}/edit`)
                            }
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            title={t("admin.customers.delete")}
                            onClick={() => handleDelete(user.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* PAGINAZIONE */}

      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            disabled={page === 0}
            onClick={() => setPage((current) => current - 1)}
          >
            ‹
          </button>

          {Array.from(
            {
              length: totalPages,
            },
            (_, index) => (
              <button
                key={index}
                type="button"
                className={`btn btn-sm ${
                  page === index ? "btn-dark" : "btn-outline-secondary"
                }`}
                onClick={() => setPage(index)}
              >
                {index + 1}
              </button>
            ),
          )}

          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            disabled={page === totalPages - 1}
            onClick={() => setPage((current) => current + 1)}
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}

export default AdminCustomers
