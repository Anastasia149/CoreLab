import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import './SupportPage.css';

const SUPPORT_EMAIL = 'anastasiya40149@gmail.com';
const INSTAGRAM_URL = 'https://www.instagram.com/akhramovich__anastasia/';
const TELEGRAM_USERNAME = '@n_astyia';
const TELEGRAM_URL = 'https://t.me/n_astyia';

type SupportRole = 'student' | 'teacher';

type FaqItem = {
  question: string;
  answer: string;
};

const STUDENT_FAQ: FaqItem[] = [
  {
    question: 'Что такое CoreLab?',
    answer:
      'CoreLab — платформа для онлайн-обучения. Вы можете искать курсы, записываться на них, проходить уроки, сдавать тесты и отслеживать прогресс в личном кабинете.',
  },
  {
    question: 'Как записаться на курс?',
    answer:
      'Откройте раздел «Поиск», выберите курс и нажмите «Записаться» или «Купить». После оплаты курс появится в «Мои курсы».',
  },
  {
    question: 'Как оплатить курс?',
    answer:
      'Добавьте курс в корзину и оформите покупку в разделе «Оплата». При проблемах с платежом напишите в поддержку — укажите название курса и email аккаунта.',
  },
  {
    question: 'Где смотреть расписание занятий?',
    answer:
      'Все запланированные занятия по вашим курсам отображаются в разделе «Расписание». Там же можно увидеть ближайшие дедлайны и события.',
  },
  {
    question: 'Как связаться с преподавателем?',
    answer:
      'На странице курса откройте профиль преподавателя. По вопросам, связанным с платформой, оплатой или доступом к материалам, обращайтесь в службу поддержки.',
  },
  {
    question: 'Можно ли вернуть деньги за курс?',
    answer:
      'Возврат рассматривается в течение 7 дней с момента покупки, если пройдено не более 20% материалов. Напишите на почту с номером заказа и причиной обращения.',
  },
  {
    question: 'Уроки или тесты не открываются — что делать?',
    answer:
      'Обновите страницу, проверьте интернет и попробуйте другой браузер. Если не помогло — отправьте в поддержку скриншот, название курса и урока.',
  },
  {
    question: 'Не могу войти в аккаунт — что делать?',
    answer:
      'Проверьте email и пароль. Если забыли пароль или не получается войти, напишите в поддержку и укажите email, с которым регистрировались.',
  },
];

const TEACHER_FAQ: FaqItem[] = [
  {
    question: 'Как создать курс?',
    answer:
      'Перейдите в «Мои курсы» и нажмите «Создать курс». Заполните название, описание, цену и обложку — курс сначала сохранится как черновик.',
  },
  {
    question: 'Как опубликовать курс?',
    answer:
      'Откройте курс в «Мои курсы», добавьте уроки и материалы, затем смените статус с «Черновик» на «Опубликован». После публикации курс станет виден студентам в поиске.',
  },
  {
    question: 'Как добавить урок или тест?',
    answer:
      'На странице курса нажмите «Добавить урок» или «Добавить тест», выберите тип занятия, заполните содержание и сохраните. Уроки можно группировать по модулям.',
  },
  {
    question: 'Как посмотреть список учеников?',
    answer:
      'На странице курса откройте вкладку со студентами — там отображаются записавшиеся ученики и их прогресс по материалам.',
  },
  {
    question: 'Как изменить цену или описание курса?',
    answer:
      'Откройте курс и перейдите в редактирование. Изменения сохраняются сразу; для опубликованного курса новая цена применяется к новым покупкам.',
  },
  {
    question: 'Не загружается видео или файл к уроку — что делать?',
    answer:
      'Проверьте формат и размер файла, стабильность интернета и попробуйте загрузить снова. Если ошибка повторяется — напишите в поддержку с названием курса и типом файла.',
  },
  {
    question: 'Как настроить расписание занятий?',
    answer:
      'В разделе «Расписание» отображаются занятия по вашим курсам. Даты и типы уроков задаются при создании или редактировании каждого урока.',
  },
  {
    question: 'Не могу войти в аккаунт — что делать?',
    answer:
      'Проверьте email и пароль. Если забыли пароль или аккаунт недоступен, напишите в поддержку и укажите email преподавателя, с которым регистрировались.',
  },
];

type Props = {
  role: SupportRole;
};

const SupportPage: React.FC<Props> = ({ role }) => {
  const faqItems = role === 'teacher' ? TEACHER_FAQ : STUDENT_FAQ;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  const contactsDesc =
    role === 'teacher'
      ? 'Не нашли ответ? Напишите нам — поможем с созданием курсов, публикацией, загрузкой материалов и техническими вопросами.'
      : 'Не нашли ответ? Напишите нам — поможем с регистрацией, оплатой, доступом к курсам и техническими вопросами.';

  return (
    <div className="support-page">
      <section className="support-card">
        <h3 className="support-section-title">Часто задаваемые вопросы</h3>
        <div className="support-faq-list">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div className="support-faq-item" key={item.question}>
                <button
                  type="button"
                  className={`support-faq-question ${isOpen ? 'active' : ''}`}
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                >
                  <span>{item.question}</span>
                  <Icon icon="mdi:chevron-down" />
                </button>
                {isOpen && <div className="support-faq-answer">{item.answer}</div>}
              </div>
            );
          })}
        </div>
      </section>

      <section className="support-card">
        <h3 className="support-section-title">Связаться с поддержкой</h3>
        <p className="support-contacts-desc">{contactsDesc}</p>
        <ul className="support-contacts-list">
          <li>
            <a className="support-contact-link" href={`mailto:${SUPPORT_EMAIL}`}>
              <Icon icon="mdi:email-outline" />
              <span>
                <span className="support-contact-label">Почта</span>
                <span className="support-contact-value">{SUPPORT_EMAIL}</span>
              </span>
            </a>
          </li>
          <li>
            <a
              className="support-contact-link"
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon icon="mdi:instagram" />
              <span>
                <span className="support-contact-label">Instagram</span>
                <span className="support-contact-value">@akhramovich__anastasia</span>
              </span>
            </a>
          </li>
          <li>
            <a
              className="support-contact-link"
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon icon="mdi:telegram" />
              <span>
                <span className="support-contact-label">Telegram</span>
                <span className="support-contact-value">{TELEGRAM_USERNAME}</span>
              </span>
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
};

export default SupportPage;
