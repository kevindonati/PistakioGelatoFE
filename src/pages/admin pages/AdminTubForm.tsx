import { ArrowLeft, ImagePlus, Save } from "lucide-react"
import { useEffect, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  createTub,
  getTubById,
  updateTub,
  type TubFormData,
  type TubTranslation,
} from "../../services/tubApi"

import "../../styles/AdminTubsForm.css"

type Language = "IT" | "EN" | "FR" | "DE"
const languages: Language[] = ["IT", "EN", "FR", "DE"]

const createEmptyTranslations = (): TubTranslation[] =>
  languages.map((language) => ({
    language,
    name: "",
    description: "",
  }))

function AdminTubForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{
    id: string
  }>()
  const isEditMode = Boolean(id)
  const [loading, setLoading] = useState(isEditMode)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState<TubFormData>({
    weight: 0,
    price: 0,
    available: true,
    translations: createEmptyTranslations(),
  })

  /*
   * CARICA VASCHETTA IN MODIFICA
   */

  useEffect(() => {
    if (!id) {
      return
    }

    const loadTub = async () => {
      try {
        setLoading(true)
        setError("")

        const [it, en, fr, de] = await Promise.all([
          getTubById(id, "IT"),
          getTubById(id, "EN"),
          getTubById(id, "FR"),
          getTubById(id, "DE"),
        ])

        setFormData({
          weight: it.weight,
          price: it.price,
          available: it.available,

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

        setError(t("admin.tubForm.loadError"))
      } finally {
        setLoading(false)
      }
    }

    loadTub()
  }, [id, t])

  /*
   * CAMBIO CAMPI
   */

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = event.target

    const checked = type === "checkbox" ? event.target.checked : undefined

    setFormData((current) => ({
      ...current,

      [name]: type === "checkbox" ? checked : Number(value),
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
    if (formData.weight <= 0) {
      return t("admin.tubForm.weightInvalid")
    }

    if (formData.price < 0) {
      return t("admin.tubForm.priceInvalid")
    }

    for (const translation of formData.translations) {
      if (!translation.name.trim()) {
        return t("admin.tubForm.nameRequired", {
          language: translation.language,
        })
      }

      if (!translation.description.trim()) {
        return t("admin.tubForm.descriptionRequired", {
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
        await updateTub(id, formData, selectedFile)
      } else {
        await createTub(formData, selectedFile)
      }

      navigate("/admin/catalog/tubs")
    } catch (error) {
      console.error(error)

      setError(t("admin.tubForm.saveError"))
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
    <div className="admin-tub-form-page">
      <div className="admin-tub-form-container">
        <div className="admin-tub-form-header">
          <div>
            <button
              type="button"
              className="admin-tub-form-back"
              onClick={() => navigate("/admin/catalog/tubs")}
            >
              <ArrowLeft size={18} />
              {t("admin.tubForm.backToTubs")}
            </button>

            <h1>
              {isEditMode
                ? t("admin.tubForm.editTitle")
                : t("admin.tubForm.createTitle")}
            </h1>

            <p>
              {isEditMode
                ? t("admin.tubForm.editSubtitle")
                : t("admin.tubForm.createSubtitle")}
            </p>
          </div>
        </div>

        {error && <div className="admin-tub-form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="admin-tub-form-grid">
            <div className="admin-tub-form-card admin-tub-form-general">
              <div className="admin-tub-form-card-body">
                <h2>{t("admin.tubForm.general")}</h2>

                <div className="admin-tub-form-fields">
                  <div className="admin-tub-form-field">
                    <label htmlFor="tub-weight">
                      {t("admin.tubForm.weight")}
                    </label>

                    <div className="admin-tub-form-input-group">
                      <input
                        id="tub-weight"
                        type="number"
                        name="weight"
                        min="1"
                        step="1"
                        value={formData.weight}
                        onChange={handleChange}
                      />
                      <span>g</span>
                    </div>
                  </div>

                  <div className="admin-tub-form-field">
                    <label htmlFor="tub-price">
                      {t("admin.tubForm.price")}
                    </label>

                    <div className="admin-tub-form-input-group">
                      <input
                        id="tub-price"
                        type="number"
                        name="price"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                      />
                      <span>€</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-tub-form-card admin-tub-form-image-card">
              <div className="admin-tub-form-card-body">
                <h2>{t("admin.tubForm.image")}</h2>

                <div className="admin-tub-form-image-preview">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt={formData.translations[0]?.name || "Tub"}
                    />
                  ) : (
                    <div className="admin-tub-form-image-empty">
                      <ImagePlus size={42} />
                      <span>{t("admin.tubForm.noImage")}</span>
                    </div>
                  )}
                </div>

                <label htmlFor="tub-image" className="admin-tub-form-label">
                  {t("admin.tubForm.chooseImage")}
                </label>

                <input
                  id="tub-image"
                  type="file"
                  className="admin-tub-form-file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            <div className="admin-tub-form-card admin-tub-form-availability">
              <div className="admin-tub-form-card-body">
                <h2>{t("admin.tubForm.features")}</h2>

                <label className="admin-tub-form-checkbox">
                  <input
                    id="tub-available"
                    type="checkbox"
                    name="available"
                    checked={formData.available}
                    onChange={handleChange}
                  />

                  <span className="admin-tub-form-checkbox-custom" />

                  <span>{t("admin.tubForm.available")}</span>
                </label>
              </div>
            </div>

            <div className="admin-tub-form-card admin-tub-form-translations">
              <div className="admin-tub-form-card-body">
                <h2>{t("admin.tubForm.translations")}</h2>

                <p className="admin-tub-form-description">
                  {t("admin.tubForm.translationsDescription")}
                </p>

                <div className="admin-tub-form-translations-grid">
                  {languages.map((language) => {
                    const translation = formData.translations.find(
                      (item) => item.language === language,
                    )

                    if (!translation) {
                      return null
                    }

                    return (
                      <div
                        className="admin-tub-form-language-card"
                        key={language}
                      >
                        <div className="admin-tub-form-language-header">
                          <h3>{getLanguageName(language)}</h3>

                          <span>{language}</span>
                        </div>

                        <div className="admin-tub-form-field">
                          <label>{t("admin.tubForm.name")}</label>

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

                        <div className="admin-tub-form-field">
                          <label>{t("admin.tubForm.description")}</label>

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
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="admin-tub-form-actions">
            <button
              type="button"
              className="admin-tub-form-cancel"
              disabled={saving}
              onClick={() => navigate("/admin/catalog/tubs")}
            >
              {t("admin.tubForm.cancel")}
            </button>

            <button
              type="submit"
              className="admin-tub-form-submit"
              disabled={saving}
            >
              <Save size={17} />

              {saving
                ? t("admin.tubForm.saving")
                : isEditMode
                  ? t("admin.tubForm.saveChanges")
                  : t("admin.tubForm.createTub")}
            </button>
          </div>
        </form>
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

export default AdminTubForm
