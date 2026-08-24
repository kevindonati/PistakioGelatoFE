import { ArrowLeft, Save } from "lucide-react"
import { useEffect, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"

import {
  createCategory,
  getCategoryById,
  updateCategory,
  type CategoryFormData,
  type CategoryTranslation,
} from "../../services/categoryApi"

type Language = "IT" | "EN" | "FR" | "DE"

const languages: Language[] = ["IT", "EN", "FR", "DE"]

const createEmptyTranslations = (): CategoryTranslation[] =>
  languages.map((language) => ({
    language,
    name: "",
    description: "",
  }))

function AdminCategoryForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { id } = useParams<{
    id: string
  }>()

  const isEditMode = Boolean(id)

  const [loading, setLoading] = useState(isEditMode)

  const [saving, setSaving] = useState(false)

  const [error, setError] = useState("")

  const [formData, setFormData] = useState<CategoryFormData>({
    image: "",
    translations: createEmptyTranslations(),
  })

  /*
   * CARICA CATEGORIA IN MODIFICA
   */

  useEffect(() => {
    if (!id) {
      return
    }

    const loadCategory = async () => {
      try {
        setLoading(true)
        setError("")

        const [it, en, fr, de] = await Promise.all([
          getCategoryById(id, "IT"),
          getCategoryById(id, "EN"),
          getCategoryById(id, "FR"),
          getCategoryById(id, "DE"),
        ])

        setFormData({
          image: it.image ?? "",

          translations: [
            {
              language: "IT",
              name: it.name,
              description: it.description,
            },
            {
              language: "EN",
              name: en.name,
              description: en.description,
            },
            {
              language: "FR",
              name: fr.name,
              description: fr.description,
            },
            {
              language: "DE",
              name: de.name,
              description: de.description,
            },
          ],
        })
      } catch (error) {
        console.error(error)

        setError(t("admin.categoryForm.loadError"))
      } finally {
        setLoading(false)
      }
    }

    loadCategory()
  }, [id, t])

  /*
   * CAMBIO IMMAGINE
   */

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormData((current) => ({
      ...current,
      image: event.target.value,
    }))
  }

  /*
   * CAMBIO TRADUZIONE
   */

  const handleTranslationChange = (
    language: Language,
    field: "name" | "description",
    value: string,
  ) => {
    setFormData((current) => ({
      ...current,

      translations: current.translations.map((translation) =>
        translation.language === language
          ? {
              ...translation,
              [field]: value,
            }
          : translation,
      ),
    }))
  }

  /*
   * VALIDAZIONE
   */

  const validateForm = () => {
    if (!formData.image.trim()) {
      return t("admin.categoryForm.imageRequired")
    }

    for (const translation of formData.translations) {
      if (!translation.name.trim()) {
        return t("admin.categoryForm.nameRequired", {
          language: translation.language,
        })
      }

      if (!translation.description.trim()) {
        return t("admin.categoryForm.descriptionRequired", {
          language: translation.language,
        })
      }
    }

    return null
  }

  /*
   * SUBMIT
   */

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    const validationError = validateForm()

    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setSaving(true)
      setError("")

      if (isEditMode && id) {
        await updateCategory(id, formData)
      } else {
        await createCategory(formData)
      }

      navigate("/admin/catalog/categories")
    } catch (error) {
      console.error(error)

      setError(t("admin.categoryForm.saveError"))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-5">{t("common.loading")}</div>
  }

  return (
    <div>
      {/* HEADER */}

      <div className="mb-4">
        <button
          type="button"
          className="btn btn-link px-0 mb-2"
          onClick={() => navigate("/admin/catalog/categories")}
        >
          <ArrowLeft size={18} className="me-1" />

          {t("admin.categoryForm.backToCategories")}
        </button>

        <h1 className="mb-1">
          {isEditMode
            ? t("admin.categoryForm.editTitle")
            : t("admin.categoryForm.createTitle")}
        </h1>

        <p className="text-muted mb-0">
          {isEditMode
            ? t("admin.categoryForm.editSubtitle")
            : t("admin.categoryForm.createSubtitle")}
        </p>
      </div>

      {/* ERROR */}

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* IMMAGINE */}

          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h2 className="h5 mb-4">{t("admin.categoryForm.image")}</h2>

                <label className="form-label">
                  {t("admin.categoryForm.imageUrl")}
                </label>

                <input
                  type="url"
                  className="form-control"
                  value={formData.image}
                  onChange={handleImageChange}
                  placeholder="https://..."
                />

                {formData.image && (
                  <div className="mt-3">
                    <img
                      src={formData.image}
                      alt="Preview"
                      style={{
                        width: 160,
                        height: 100,
                        objectFit: "cover",
                        borderRadius: 10,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* TRADUZIONI */}

          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h2 className="h5 mb-1">
                  {t("admin.categoryForm.translations")}
                </h2>

                <p className="text-muted small mb-4">
                  {t("admin.categoryForm.translationsDescription")}
                </p>

                <div className="row g-4">
                  {languages.map((language) => {
                    const translation = formData.translations.find(
                      (item) => item.language === language,
                    )

                    if (!translation) {
                      return null
                    }

                    return (
                      <div className="col-12 col-lg-6" key={language}>
                        <div className="border rounded p-3 h-100">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3 className="h6 mb-0">
                              {getLanguageName(language)}
                            </h3>

                            <span className="badge text-bg-light">
                              {language}
                            </span>
                          </div>

                          <div className="mb-3">
                            <label className="form-label">
                              {t("admin.categoryForm.name")}
                            </label>

                            <input
                              type="text"
                              className="form-control"
                              value={translation.name}
                              onChange={(event) =>
                                handleTranslationChange(
                                  language,
                                  "name",
                                  event.target.value,
                                )
                              }
                            />
                          </div>

                          <div>
                            <label className="form-label">
                              {t("admin.categoryForm.description")}
                            </label>

                            <textarea
                              className="form-control"
                              rows={4}
                              value={translation.description}
                              onChange={(event) =>
                                handleTranslationChange(
                                  language,
                                  "description",
                                  event.target.value,
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AZIONI */}

        <div className="d-flex justify-content-end gap-2 mt-4 mb-5">
          <button
            type="button"
            className="btn btn-outline-secondary"
            disabled={saving}
            onClick={() => navigate("/admin/catalog/categories")}
          >
            {t("admin.categoryForm.cancel")}
          </button>

          <button type="submit" className="btn btn-dark" disabled={saving}>
            <Save size={17} className="me-2" />

            {saving
              ? t("admin.categoryForm.saving")
              : isEditMode
                ? t("admin.categoryForm.saveChanges")
                : t("admin.categoryForm.createCategory")}
          </button>
        </div>
      </form>
    </div>
  )
}

function getLanguageName(language: Language) {
  switch (language) {
    case "IT":
      return "Italiano"

    case "EN":
      return "English"

    case "FR":
      return "Français"

    case "DE":
      return "Deutsch"
  }
}

export default AdminCategoryForm
