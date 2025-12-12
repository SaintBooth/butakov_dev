"use client"

import { useLocale } from "next-intl"

const privacyRU = `
Мы собираем только необходимые данные, предоставленные через форму обратной связи. 
Данные используются для связи по вашему запросу и не передаются третьим лицам, кроме случаев, предусмотренных законом.
Вы можете запросить удаление своих данных, написав на указанный контакт.
`

const privacyEN = `
We collect only the data you provide via the contact form.
Data is used to respond to your request and is not shared with third parties except as required by law.
You may request deletion of your data by contacting us.
`

export default function PrivacyPage() {
  const locale = useLocale()
  const text = locale === "ru" ? privacyRU : privacyEN

  return (
    <div className="container mx-auto px-4 py-8 prose dark:prose-invert">
      <h1 className="text-3xl font-bold mb-4">
        {locale === "ru" ? "Политика конфиденциальности" : "Privacy Policy"}
      </h1>
      {text.split("\n").map((line, idx) => (
        <p key={idx}>{line.trim()}</p>
      ))}
    </div>
  )
}

