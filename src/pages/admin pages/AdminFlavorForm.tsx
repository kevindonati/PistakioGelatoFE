import { useEffect, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { ArrowLeft, ImagePlus, Save } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"

import {
  createFlavor,
  getFlavorById,
  updateFlavor,
  type FlavorFormData,
  type FlavorTranslation,
} from "../../services/flavorApi"

import { getCategories, type Category } from "../../services/categoryApi"

type Language = "IT" | "EN" | "FR" | "DE"

const languages: Language[] = ["IT", "EN", "FR", "DE"]

const createEmptyTranslations = (): FlavorTranslation[] =>
  languages.map((language) => ({
    language,
    name: "",
    description: "",
  }))

function AdminFlavorForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { id } = useParams<{
    id: string
  }>()

  const isEditMode = Boolean(id)

  const [categories, setCategories] = useState<Category[]>([])

  const [loading, setLoading] = useState(isEditMode)

  const [saving, setSaving] = useState(false)

  const [error, setError] = useState("")

  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [formData, setFormData] = useState<FlavorFormData>({
    referralCode: "",
    stockPortions: 0,
    available: true,
    vegan: false,
    lactoseFree: false,
    glutenFree: false,
    sugarFree: false,
    category: "",
    translations: createEmptyTranslations(),
  })

  /*
   * CARICA CATEGORIE
   */

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories({
          page: 0,
          size: 50,
          language: "IT",
        })

        setCategories(data.content)
      } catch (error) {
        console.error(error)

        setError(t("admin.flavorForm.categoriesLoadError"))
      }
    }

    loadCategories()
  }, [t])

  /*
   * CARICA GUSTO IN MODIFICA
   */

  useEffect(() => {
    if (!id) {
      return
    }

    const loadFlavor = async () => {
      try {
        setLoading(true)
        setError("")

        const [it, en, fr, de] = await Promise.all([
          getFlavorById(id, "IT"),
          getFlavorById(id, "EN"),
          getFlavorById(id, "FR"),
          getFlavorById(id, "DE"),
        ])

        setFormData({
          referralCode: it.referralCode,

          stockPortions: it.stockPortions,

          available: it.available,

          vegan: it.vegan,

          lactoseFree: it.lactoseFree,

          glutenFree: it.glutenFree,

          sugarFree: it.sugarFree,

          category: it.category,

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

        setImagePreview(it.image ?? null)
      } catch (error) {
        console.error(error)

        setError(t("admin.flavorForm.loadError"))
      } finally {
        setLoading(false)
      }
    }

    loadFlavor()
  }, [id, t])

  /*
   * CAMBIO CAMPI PRINCIPALI
   */

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = event.target

    const checked =
      type === "checkbox"
        ? (event.target as HTMLInputElement).checked
        : undefined

    setFormData((current) => ({
      ...current,

      [name]:
        type === "checkbox"
          ? checked
          : name === "stockPortions"
            ? Number(value)
            : value,
    }))
  }

  /*
   * CAMBIO TRADUZIONI
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
   * CAMBIO IMMAGINE
   */

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setSelectedFile(file)

    const previewUrl = URL.createObjectURL(file)

    setImagePreview(previewUrl)
  }

  /*
   * VALIDAZIONE
   */

  const validateForm = () => {
    if (!formData.referralCode.trim()) {
      return t("admin.flavorForm.referralCodeRequired")
    }

    if (!formData.category) {
      return t("admin.flavorForm.categoryRequired")
    }

    if (formData.stockPortions < 0) {
      return t("admin.flavorForm.stockInvalid")
    }

    for (const translation of formData.translations) {
      if (!translation.name.trim()) {
        return t("admin.flavorForm.nameRequired", {
          language: translation.language,
        })
      }

      if (!translation.description.trim()) {
        return t("admin.flavorForm.descriptionRequired", {
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
        await updateFlavor(id, formData, selectedFile)
      } else {
        await createFlavor(formData, selectedFile)
      }

      navigate("/admin/catalog/flavors")
    } catch (error) {
      console.error(error)

      setError(t("admin.flavorForm.saveError"))
    } finally {
      setSaving(false)
    }
  }

  /*
   * LOADING
   */

  if (loading) {
    return <div className="text-center py-5">{t("common.loading")}</div>
  }

  return (
    <div>
      {/* HEADER */}

      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <button
            type="button"
            className="btn btn-link px-0 mb-2"
            onClick={() => navigate("/admin/catalog/flavors")}
          >
            <ArrowLeft size={18} className="me-1" />

            {t("admin.flavorForm.backToFlavors")}
          </button>

          <h1 className="mb-1">
            {isEditMode
              ? t("admin.flavorForm.editTitle")
              : t("admin.flavorForm.createTitle")}
          </h1>

          <p className="text-muted mb-0">
            {isEditMode
              ? t("admin.flavorForm.editSubtitle")
              : t("admin.flavorForm.createSubtitle")}
          </p>
        </div>
      </div>

      {/* ERROR */}

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* INFORMAZIONI GENERALI */}

          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <h2 className="h5 mb-4">{t("admin.flavorForm.general")}</h2>

                <div className="row g-3">
                  {/* CODICE */}

                  <div className="col-12 col-md-6">
                    <label className="form-label">
                      {t("admin.flavorForm.referralCode")}
                    </label>

                    <input
                      type="text"
                      name="referralCode"
                      className="form-control"
                      value={formData.referralCode}
                      onChange={handleChange}
                      placeholder="PIST-001"
                    />
                  </div>

                  {/* STOCK */}

                  <div className="col-12 col-md-6">
                    <label className="form-label">
                      {t("admin.flavorForm.stockPortions")}
                    </label>

                    <input
                      type="number"
                      name="stockPortions"
                      min="0"
                      className="form-control"
                      value={formData.stockPortions}
                      onChange={handleChange}
                    />
                  </div>

                  {/* CATEGORIA */}

                  <div className="col-12">
                    <label className="form-label">
                      {t("admin.flavorForm.category")}
                    </label>

                    <select
                      name="category"
                      className="form-select"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="">
                        {t("admin.flavorForm.selectCategory")}
                      </option>

                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* IMMAGINE */}

          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <h2 className="h5 mb-4">{t("admin.flavorForm.image")}</h2>

                <div
                  className="border rounded d-flex align-items-center justify-content-center overflow-hidden mb-3"
                  style={{
                    height: "240px",
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt={formData.translations[0]?.name || "Flavor"}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div className="text-center text-muted">
                      <ImagePlus size={40} className="mb-2" />

                      <div>{t("admin.flavorForm.noImage")}</div>
                    </div>
                  )}
                </div>

                <label className="form-label">
                  {t("admin.flavorForm.chooseImage")}
                </label>

                <input
                  type="file"
                  className="form-control"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                />
              </div>
            </div>
          </div>

          {/* CARATTERISTICHE */}

          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h2 className="h5 mb-4">{t("admin.flavorForm.features")}</h2>

                <div className="row g-3">
                  <CheckboxField
                    name="available"
                    label={t("admin.flavorForm.available")}
                    checked={formData.available}
                    onChange={handleChange}
                  />

                  <CheckboxField
                    name="vegan"
                    label={t("admin.flavorForm.vegan")}
                    checked={formData.vegan}
                    onChange={handleChange}
                  />

                  <CheckboxField
                    name="lactoseFree"
                    label={t("admin.flavorForm.lactoseFree")}
                    checked={formData.lactoseFree}
                    onChange={handleChange}
                  />

                  <CheckboxField
                    name="glutenFree"
                    label={t("admin.flavorForm.glutenFree")}
                    checked={formData.glutenFree}
                    onChange={handleChange}
                  />

                  <CheckboxField
                    name="sugarFree"
                    label={t("admin.flavorForm.sugarFree")}
                    checked={formData.sugarFree}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TRADUZIONI */}

          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h2 className="h5 mb-1">
                  {t("admin.flavorForm.translations")}
                </h2>

                <p className="text-muted small mb-4">
                  {t("admin.flavorForm.translationsDescription")}
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

                          {/* NOME */}

                          <div className="mb-3">
                            <label className="form-label">
                              {t("admin.flavorForm.name")}
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

                          {/* DESCRIZIONE */}

                          <div>
                            <label className="form-label">
                              {t("admin.flavorForm.description")}
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
            onClick={() => navigate("/admin/catalog/flavors")}
          >
            {t("admin.flavorForm.cancel")}
          </button>

          <button type="submit" className="btn btn-dark" disabled={saving}>
            <Save size={17} className="me-2" />

            {saving
              ? t("admin.flavorForm.saving")
              : isEditMode
                ? t("admin.flavorForm.saveChanges")
                : t("admin.flavorForm.createFlavor")}
          </button>
        </div>
      </form>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* CHECKBOX */
/* -------------------------------------------------------------------------- */

interface CheckboxFieldProps {
  name: string
  label: string
  checked: boolean
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

function CheckboxField({ name, label, checked, onChange }: CheckboxFieldProps) {
  return (
    <div className="col-12 col-md-6 col-lg-4">
      <div className="form-check">
        <input
          id={`flavor-${name}`}
          type="checkbox"
          name={name}
          className="form-check-input"
          checked={checked}
          onChange={onChange}
        />

        <label htmlFor={`flavor-${name}`} className="form-check-label">
          {label}
        </label>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* LINGUE */
/* -------------------------------------------------------------------------- */

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

export default AdminFlavorForm
