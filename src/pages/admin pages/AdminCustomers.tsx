import { Edit, Search, Trash2, UserRound, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import { deleteUser, getUsers, type AdminUser } from "../../services/userApi"
import "../../styles/AdminCustomers.css"

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
    return <div className="admin-customers-loading">{t("common.loading")}</div>
  }

  return (
    <div className="admin-customers-page">
      <div className="admin-customers-header">
        <div>
          <h1>{t("admin.customers.title")}</h1>
          <p>{t("admin.customers.subtitle")}</p>
        </div>
      </div>

      {error && <div className="admin-customers-error">{error}</div>}

      <div className="admin-customers-filters">
        <div className="admin-customers-field admin-customers-search-field">
          <label>{t("admin.customers.search")}</label>

          <div className="admin-customers-input-wrapper">
            <Search size={17} />

            <input
              type="text"
              placeholder={t("admin.customers.searchPlaceholder")}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(0)
              }}
            />
          </div>
        </div>

        <div className="admin-customers-field">
          <label>{t("admin.customers.role")}</label>

          <select
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

        <div className="admin-customers-field">
          <label>{t("admin.customers.status")}</label>

          <select
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

            <option value="DISABLED">{t("admin.customers.disabled")}</option>
          </select>
        </div>

        {hasFilters && (
          <button
            type="button"
            className="admin-customers-reset-button"
            onClick={resetFilters}
            title={t("admin.customers.resetFilters")}
          >
            <X size={17} />
          </button>
        )}
      </div>

      <div className="admin-customers-toolbar">
        <span>
          {t("admin.customers.results", {
            count: filteredUsers.length,
          })}
        </span>
      </div>

      <div className="admin-customers-table-card">
        {filteredUsers.length === 0 ? (
          <div className="admin-customers-empty">
            <UserRound size={42} />

            <div>
              {t(
                hasFilters
                  ? "admin.customers.noResults"
                  : "admin.customers.empty",
              )}
            </div>
          </div>
        ) : (
          <div className="admin-customers-table-wrapper">
            <table className="admin-customers-table">
              <thead>
                <tr>
                  <th>{t("admin.customers.customer")}</th>
                  <th>{t("admin.customers.email")}</th>
                  <th>{t("admin.customers.phone")}</th>
                  <th>{t("admin.customers.language")}</th>
                  <th>{t("admin.customers.role")}</th>
                  <th>{t("admin.customers.status")}</th>
                  <th>{t("admin.customers.actions")}</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="admin-customers-user">
                        <div className="admin-customers-avatar">
                          <UserRound size={19} />
                        </div>

                        <div>
                          <div className="admin-customers-user-name">
                            {user.name} {user.surname}
                          </div>

                          <div className="admin-customers-user-id">
                            {user.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>{user.email}</td>

                    <td>{user.phone || "—"}</td>

                    <td>
                      <span className="admin-customers-language">
                        {user.language}
                      </span>
                    </td>

                    <td>
                      {user.role === "ADMIN" ? (
                        <span className="admin-customers-badge admin">
                          {t("admin.customers.admin")}
                        </span>
                      ) : (
                        <span className="admin-customers-badge user">
                          {t("admin.customers.user")}
                        </span>
                      )}
                    </td>

                    <td>
                      {user.enabled ? (
                        <span className="admin-customers-badge active">
                          {t("admin.customers.active")}
                        </span>
                      ) : (
                        <span className="admin-customers-badge disabled">
                          {t("admin.customers.disabled")}
                        </span>
                      )}
                    </td>

                    <td>
                      <div className="admin-customers-actions">
                        <button
                          type="button"
                          className="admin-customers-action edit"
                          title={t("admin.customers.edit")}
                          onClick={() =>
                            navigate(`/admin/customers/${user.id}`)
                          }
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          type="button"
                          className="admin-customers-action delete"
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

      {totalPages > 1 && (
        <div className="admin-customers-pagination">
          <button
            type="button"
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
                className={page === index ? "active" : ""}
                onClick={() => setPage(index)}
              >
                {index + 1}
              </button>
            ),
          )}

          <button
            type="button"
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
