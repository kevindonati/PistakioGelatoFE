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
    <div>
      {/* HEADER */}

      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <button
            type="button"
            className="btn btn-link px-0 mb-2"
            onClick={() => navigate("/admin/catalog/tubs")}
          >
            <ArrowLeft size={18} className="me-1" />

            {t("admin.tubForm.backToTubs")}
          </button>

          <h1 className="mb-1">
            {isEditMode
              ? t("admin.tubForm.editTitle")
              : t("admin.tubForm.createTitle")}
          </h1>

          <p className="text-muted mb-0">
            {isEditMode
              ? t("admin.tubForm.editSubtitle")
              : t("admin.tubForm.createSubtitle")}
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
                <h2 className="h5 mb-4">{t("admin.tubForm.general")}</h2>

                <div className="row g-3">
                  {/* PESO */}

                  <div className="col-12 col-md-6">
                    <label className="form-label">
                      {t("admin.tubForm.weight")}
                    </label>

                    <div className="input-group">
                      <input
                        type="number"
                        name="weight"
                        min="1"
                        step="1"
                        className="form-control"
                        value={formData.weight}
                        onChange={handleChange}
                      />

                      <span className="input-group-text">g</span>
                    </div>
                  </div>

                  {/* PREZZO */}

                  <div className="col-12 col-md-6">
                    <label className="form-label">
                      {t("admin.tubForm.price")}
                    </label>

                    <div className="input-group">
                      <input
                        type="number"
                        name="price"
                        min="0"
                        step="0.01"
                        className="form-control"
                        value={formData.price}
                        onChange={handleChange}
                      />

                      <span className="input-group-text">€</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* IMMAGINE */}

          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <h2 className="h5 mb-4">{t("admin.tubForm.image")}</h2>

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
                      alt={formData.translations[0]?.name || "Tub"}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div className="text-center text-muted">
                      <ImagePlus size={40} className="mb-2" />

                      <div>{t("admin.tubForm.noImage")}</div>
                    </div>
                  )}
                </div>

                <label className="form-label">
                  {t("admin.tubForm.chooseImage")}
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

          {/* DISPONIBILITÀ */}

          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h2 className="h5 mb-4">{t("admin.tubForm.features")}</h2>

                <div className="form-check">
                  <input
                    id="tub-available"
                    type="checkbox"
                    name="available"
                    className="form-check-input"
                    checked={formData.available}
                    onChange={handleChange}
                  />

                  <label htmlFor="tub-available" className="form-check-label">
                    {t("admin.tubForm.available")}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* TRADUZIONI */}

          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h2 className="h5 mb-1">{t("admin.tubForm.translations")}</h2>

                <p className="text-muted small mb-4">
                  {t("admin.tubForm.translationsDescription")}
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
                              {t("admin.tubForm.name")}
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
                              {t("admin.tubForm.description")}
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
            onClick={() => navigate("/admin/catalog/tubs")}
          >
            {t("admin.tubForm.cancel")}
          </button>

          <button type="submit" className="btn btn-dark" disabled={saving}>
            <Save size={17} className="me-2" />

            {saving
              ? t("admin.tubForm.saving")
              : isEditMode
                ? t("admin.tubForm.saveChanges")
                : t("admin.tubForm.createTub")}
          </button>
        </div>
      </form>
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
