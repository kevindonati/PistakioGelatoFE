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

import "../../styles/AdminFlavorForm.css"

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

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setSelectedFile(file)

    const previewUrl = URL.createObjectURL(file)

    setImagePreview(previewUrl)
  }

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

  if (loading) {
    return (
      <div className="admin-flavor-form-loading">{t("common.loading")}</div>
    )
  }

  return (
    <div className="admin-flavor-form-page">
      <div className="admin-flavor-form-container">
        <header className="admin-flavor-form-header">
          <div>
            <button
              type="button"
              className="admin-flavor-form-back"
              onClick={() => navigate("/admin/catalog/flavors")}
            >
              <ArrowLeft size={17} />
              {t("admin.flavorForm.backToFlavors")}
            </button>

            <h1>
              {isEditMode
                ? t("admin.flavorForm.editTitle")
                : t("admin.flavorForm.createTitle")}
            </h1>

            <p>
              {isEditMode
                ? t("admin.flavorForm.editSubtitle")
                : t("admin.flavorForm.createSubtitle")}
            </p>
          </div>
        </header>

        {error && <div className="admin-flavor-form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="admin-flavor-form-grid">
            <section className="admin-flavor-form-card admin-flavor-form-general">
              <div className="admin-flavor-form-card-header">
                <h2>{t("admin.flavorForm.general")}</h2>
              </div>

              <div className="admin-flavor-form-card-body">
                <div className="admin-flavor-form-fields">
                  <div className="admin-flavor-form-field">
                    <label>{t("admin.flavorForm.referralCode")}</label>

                    <input
                      type="text"
                      name="referralCode"
                      value={formData.referralCode}
                      onChange={handleChange}
                      placeholder="PIST-001"
                    />
                  </div>

                  <div className="admin-flavor-form-field">
                    <label>{t("admin.flavorForm.stockPortions")}</label>

                    <input
                      type="number"
                      name="stockPortions"
                      min="0"
                      value={formData.stockPortions}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="admin-flavor-form-field admin-flavor-form-full">
                    <label>{t("admin.flavorForm.category")}</label>

                    <select
                      name="category"
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
            </section>

            <section className="admin-flavor-form-card admin-flavor-form-image-card">
              <div className="admin-flavor-form-card-header">
                <h2>{t("admin.flavorForm.image")}</h2>
              </div>

              <div className="admin-flavor-form-card-body">
                <div className="admin-flavor-form-image-preview">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt={formData.translations[0]?.name || "Flavor"}
                    />
                  ) : (
                    <div className="admin-flavor-form-image-empty">
                      <ImagePlus size={42} />
                      <span>{t("admin.flavorForm.noImage")}</span>
                    </div>
                  )}
                </div>

                <label className="admin-flavor-form-file-label">
                  {t("admin.flavorForm.chooseImage")}
                </label>

                <input
                  type="file"
                  className="admin-flavor-form-file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                />
              </div>
            </section>

            <section className="admin-flavor-form-card admin-flavor-form-full-card">
              <div className="admin-flavor-form-card-header">
                <h2>{t("admin.flavorForm.features")}</h2>
              </div>

              <div className="admin-flavor-form-card-body">
                <div className="admin-flavor-form-checkboxes">
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
            </section>

            <section className="admin-flavor-form-card admin-flavor-form-full-card">
              <div className="admin-flavor-form-card-header">
                <h2>{t("admin.flavorForm.translations")}</h2>

                <p>{t("admin.flavorForm.translationsDescription")}</p>
              </div>

              <div className="admin-flavor-form-card-body">
                <div className="admin-flavor-form-translations">
                  {languages.map((language) => {
                    const translation = formData.translations.find(
                      (item) => item.language === language,
                    )

                    if (!translation) {
                      return null
                    }

                    return (
                      <div
                        className="admin-flavor-form-translation"
                        key={language}
                      >
                        <div className="admin-flavor-form-translation-header">
                          <h3>{getLanguageName(language)}</h3>

                          <span>{language}</span>
                        </div>

                        <div className="admin-flavor-form-field">
                          <label>{t("admin.flavorForm.name")}</label>

                          <input
                            type="text"
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

                        <div className="admin-flavor-form-field">
                          <label>{t("admin.flavorForm.description")}</label>

                          <textarea
                            rows={5}
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
                    )
                  })}
                </div>
              </div>
            </section>
          </div>

          <div className="admin-flavor-form-actions">
            <button
              type="button"
              className="admin-flavor-form-cancel"
              disabled={saving}
              onClick={() => navigate("/admin/catalog/flavors")}
            >
              {t("admin.flavorForm.cancel")}
            </button>

            <button
              type="submit"
              className="admin-flavor-form-save"
              disabled={saving}
            >
              <Save size={17} />

              {saving
                ? t("admin.flavorForm.saving")
                : isEditMode
                  ? t("admin.flavorForm.saveChanges")
                  : t("admin.flavorForm.createFlavor")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface CheckboxFieldProps {
  name: string
  label: string
  checked: boolean
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

function CheckboxField({ name, label, checked, onChange }: CheckboxFieldProps) {
  return (
    <label className="admin-flavor-form-checkbox">
      <input
        id={`flavor-${name}`}
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
      />

      <span className="admin-flavor-form-checkbox-box" />

      <span>{label}</span>
    </label>
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

export default AdminFlavorForm
