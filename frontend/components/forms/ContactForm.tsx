"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { submitContactForm, ContactSubmission } from "@/lib/api"
import { Link } from "@/navigation"
import { useLocale } from "next-intl"
import { Clock, Shield, Mail, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().max(20, "Phone number must be less than 20 characters").optional().or(z.literal("")),
  message: z.string().min(10, "Message must be at least 10 characters"),
  consent_given: z.boolean().refine((val) => val === true, {
    message: "You must provide consent to submit this form",
  }),
})

type ContactFormValues = z.infer<typeof contactFormSchema>

export function ContactForm() {
  const t = useTranslations('contact')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
      consent_given: false,
    },
  })

  const consentGiven = watch("consent_given")

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: "" })

    try {
      const submission: ContactSubmission = {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        message: data.message,
        consent_given: data.consent_given,
      }

      const response = await submitContactForm(submission)

      if (response.status === "success") {
        setSubmitStatus({
          type: "success",
          message: response.message || t('success'),
        })
        reset()
      } else {
        // Handle validation errors from backend
        const errorMessages = response.errors
          ? Object.values(response.errors).flat().join(", ")
          : response.message || t('error')
        
        setSubmitStatus({
          type: "error",
          message: errorMessages,
        })
      }
    } catch (error) {
      let errorMessage = t('error')
      
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "object" && error !== null && "errors" in error) {
        // Handle API error response with errors object
        const apiError = error as { errors?: Record<string, string[]> }
        if (apiError.errors) {
          errorMessage = Object.values(apiError.errors).flat().join(", ")
        }
      }
      
      setSubmitStatus({
        type: "error",
        message: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  const formAction = `${apiUrl}/api/contact/`

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Trust Indicators */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{t('trustIndicator.responseTime', { defaultValue: "Обычно отвечаю в течение 24 часов" })}</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span>{t('trustIndicator.privacy', { defaultValue: "Конфиденциально и безопасно" })}</span>
        </div>
      </div>

      {/* Alternative Contact Methods */}
      <div className="flex flex-wrap gap-4">
        <a
          href="mailto:contact@butakov.dev"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <Mail className="h-4 w-4" />
          <span>{t('alternativeContacts.email', { defaultValue: "Email" })}</span>
        </a>
        <a
          href="https://t.me/devbutakov"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{t('alternativeContacts.telegram', { defaultValue: "Telegram" })}</span>
        </a>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('formTitle')}</CardTitle>
          <CardDescription>
            {t('formDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progressive Enhancement: Native form fallback */}
          <form 
            action={formAction}
            method="POST"
            onSubmit={(e) => {
              // Enhanced submission with React Hook Form when JS available
              e.preventDefault()
              handleSubmit(onSubmit)(e)
            }}
            className="space-y-6"
          >
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">
              {t('name')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder={t('name')}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">
              {t('email')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="your.email@example.com"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone">{t('phone')}</Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              placeholder="+7 (900) 123-45-67"
              disabled={isSubmitting}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          {/* Message Field */}
          <div className="space-y-2">
            <Label htmlFor="message">
              {t('message')} <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              {...register("message")}
              placeholder={t('message')}
              rows={6}
              disabled={isSubmitting}
            />
            {errors.message && (
              <p className="text-sm text-destructive">{errors.message.message}</p>
            )}
          </div>

          {/* Consent Checkbox - 152-ФЗ Compliance */}
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="consent"
                {...register("consent_given")}
                disabled={isSubmitting}
                className="mt-1"
              />
              <Label
                htmlFor="consent"
                className="text-sm leading-relaxed cursor-pointer"
              >
                {t('consent')}{" "}
                <Link
                  href="/privacy"
                  className="text-primary underline hover:text-primary/80"
                  target="_blank"
                >
                  {t('privacyPolicy')}
                </Link>
                <span className="text-destructive"> *</span>
              </Label>
            </div>
            {errors.consent_given && (
              <p className="text-sm text-destructive">{errors.consent_given.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!consentGiven || isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? t('submitting') : t('submit')}
          </Button>

          {/* Status Messages */}
          {submitStatus.type === "success" && (
            <div className="p-4 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">
                {submitStatus.message}
              </p>
            </div>
          )}

          {submitStatus.type === "error" && (
            <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">
                {submitStatus.message}
              </p>
            </div>
          )}
        </form>
        </CardContent>
      </Card>
    </div>
  )
}

