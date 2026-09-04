import { ArrowLeft, ImagePlus, Save, X } from "lucide-react"
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
import "../../styles/AdminCategoryForm.css"

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

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState("")

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

        setPreviewUrl(it.image ?? "")
      } catch (error) {
        console.error(error)
        setError(t("admin.categoryForm.loadError"))
      } finally {
        setLoading(false)
      }
    }

    loadCategory()
  }, [id, t])

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      setError(t("admin.categoryForm.invalidImage"))
      event.target.value = ""
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(t("admin.categoryForm.imageTooLarge"))
      event.target.value = ""
      return
    }

    setError("")

    if (previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl)
    }

    const newPreviewUrl = URL.createObjectURL(file)

    setSelectedFile(file)
    setPreviewUrl(newPreviewUrl)
  }

  const handleRemoveImage = () => {
    if (previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl)
    }

    setSelectedFile(null)
    setPreviewUrl("")
    setFormData((current) => ({
      ...current,
      image: "",
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

  const validateForm = () => {
    if (!isEditMode && !selectedFile && !formData.image) {
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
        await updateCategory(id, formData, selectedFile)
      } else {
        await createCategory(formData, selectedFile)
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
    <div className="admin-category-form">
      <div className="admin-category-form-header">
        <div>
          <button
            type="button"
            className="admin-category-form-back"
            onClick={() => navigate("/admin/catalog/categories")}
          >
            <ArrowLeft size={18} />
            {t("admin.categoryForm.backToCategories")}
          </button>

          <h1>
            {isEditMode
              ? t("admin.categoryForm.editTitle")
              : t("admin.categoryForm.createTitle")}
          </h1>

          <p>
            {isEditMode
              ? t("admin.categoryForm.editSubtitle")
              : t("admin.categoryForm.createSubtitle")}
          </p>
        </div>
      </div>

      {error && <div className="admin-category-form-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="admin-category-form-section">
          <div className="admin-category-form-section-header">
            <div>
              <h2>{t("admin.categoryForm.image")}</h2>
              <p>{t("admin.categoryForm.imageDescription")}</p>
            </div>
          </div>

          <div className="admin-category-image-upload">
            {previewUrl ? (
              <div className="admin-category-image-preview">
                <img
                  src={previewUrl}
                  alt={t("admin.categoryForm.imagePreview")}
                />

                <button
                  type="button"
                  className="admin-category-image-remove"
                  onClick={handleRemoveImage}
                  disabled={saving}
                  title={t("admin.categoryForm.removeImage")}
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <label
                htmlFor="category-image"
                className="admin-category-image-placeholder"
              >
                <ImagePlus size={32} />

                <span>{t("admin.categoryForm.chooseImage")}</span>

                <small>{t("admin.categoryForm.imageFormats")}</small>
              </label>
            )}

            <div className="admin-category-image-controls">
              <label
                htmlFor="category-image"
                className="admin-category-image-button"
              >
                <ImagePlus size={17} />

                {previewUrl
                  ? t("admin.categoryForm.changeImage")
                  : t("admin.categoryForm.chooseImage")}
              </label>

              <input
                id="category-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={saving}
                hidden
              />

              {selectedFile && (
                <span className="admin-category-image-name">
                  {selectedFile.name}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="admin-category-form-section">
          <div className="admin-category-form-section-header">
            <div>
              <h2>{t("admin.categoryForm.translations")}</h2>

              <p>{t("admin.categoryForm.translationsDescription")}</p>
            </div>
          </div>

          <div className="admin-category-translations">
            {languages.map((language) => {
              const translation = formData.translations.find(
                (item) => item.language === language,
              )

              if (!translation) {
                return null
              }

              return (
                <div className="admin-category-translation" key={language}>
                  <div className="admin-category-translation-header">
                    <h3>{getLanguageName(language)}</h3>

                    <span>{language}</span>
                  </div>

                  <div className="admin-category-field">
                    <label>{t("admin.categoryForm.name")}</label>

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
                      disabled={saving}
                    />
                  </div>

                  <div className="admin-category-field">
                    <label>{t("admin.categoryForm.description")}</label>

                    <textarea
                      rows={4}
                      value={translation.description}
                      onChange={(event) =>
                        handleTranslationChange(
                          language,
                          "description",
                          event.target.value,
                        )
                      }
                      disabled={saving}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="admin-category-form-actions">
          <button
            type="button"
            className="admin-category-cancel-button"
            disabled={saving}
            onClick={() => navigate("/admin/catalog/categories")}
          >
            {t("admin.categoryForm.cancel")}
          </button>

          <button
            type="submit"
            className="admin-category-save-button"
            disabled={saving}
          >
            <Save size={17} />

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
