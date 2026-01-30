import { Contact, EmailTemplate } from "@/types";
import { generateId } from "@/lib/utils";

export const initialContacts: Contact[] = [
  {
    id: generateId(),
    companyName: "ТехСтарт",
    email: "info@techstart.ru",
    contactPerson: "Алексей Петров",
    phone: "+7 (999) 123-45-67",
    status: "replied",
    lastContacted: new Date(Date.now() - 86400000),
    createdAt: new Date(Date.now() - 604800000),
  },
  {
    id: generateId(),
    companyName: "МедиаГрупп",
    email: "hello@mediagroup.com",
    contactPerson: "Мария Сидорова",
    status: "opened",
    lastContacted: new Date(Date.now() - 172800000),
    createdAt: new Date(Date.now() - 604800000),
  },
  {
    id: generateId(),
    companyName: "ИнноваСофт",
    email: "contact@innovasoft.ru",
    contactPerson: "Дмитрий Козлов",
    status: "sent",
    lastContacted: new Date(Date.now() - 259200000),
    createdAt: new Date(Date.now() - 432000000),
  },
];

export const initialTemplates: EmailTemplate[] = [
  {
    id: generateId(),
    name: "Первое знакомство",
    subject: "Предложение о сотрудничестве для {{company}}",
    body: `Здравствуйте, {{contact}}!

Меня зовут [Ваше имя], и я представляю компанию [Название компании].

Мы специализируемся на разработке современных веб-приложений и мобильных решений. Изучив деятельность {{company}}, я уверен, что наши услуги могут быть вам полезны.

Предлагаю назначить короткий звонок, чтобы обсудить возможное сотрудничество.

С уважением,
[Ваше имя]
[Контактные данные]`,
    createdAt: new Date(Date.now() - 604800000),
  },
];
