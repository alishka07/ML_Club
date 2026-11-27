/*
  Данные сайта CU ML Club.
  Здесь всё, что нужно менять без копания в логике: события, команда, варианты в формах.
  События настоящие; команда пока — примеры (sample data), замените на настоящую.

  Любой текст можно писать на двух языках: {en: '...', ru: '...'}.
  Если написать просто строку, она покажется на обоих языках (удобно для имён, метрик, ролей вроде 'NLP').

  Событие (events):
    id      уникальная строка, по ней хранится регистрация в браузере
    type    'workshop' (воркшоп), 'lecture' (лекция), 'meetup' (встреча); для будущего есть и
            'club' (хакатон клуба), 'webinar' (вебинар), 'community' (студенческий проект)
    title   название
    date    дата и время начала в формате 'YYYY-MM-DDTHH:MM' (местное время)
    about   описание для окна события
  Необязательные поля:
    end       когда заканчивается ('YYYY-MM-DDTHH:MM'); без него событие считается прошедшим через 2 часа
              после начала. Прошедшие события показываются с пометкой «Уже прошло» и без записи
    dur       длительность текстом
    where     где проходит
    time      время текстом для окна события, если оно сложнее одного начала (например, две сессии)
    cardTime  короткое время для карточки (например, '13:00 · 15:00')
    img       картинка или постер для окна события (файл в assets/events/)
    seats, taken   всего мест и сколько занято (тогда на карточке будет полоска мест)
    metric, data        для хакатонов (метрика и датасет)
    speaker             для лекций и вебинаров
    org, roles          для студенческих проектов (организатор и кого ищут)
  Порядок в массиве не важен: на полке карточки сортируются по дате.
*/
window.CLUB = {
  events: [
    {id: 'teambuilding-2026-10', type: 'meetup', date: '2026-10-09T13:00', end: '2026-10-09T15:00',
      img: 'assets/events/team-building.jpg',
      title: {en: 'Team-building session', ru: 'Тимбилдинг'},
      where: {en: 'Room 4.6', ru: 'Кабинет 4.6'},
      about: {en: 'Get to know each other better, play board games, ask about ML/AI paths and just have a good time. Snacks and drinks are on us 🐉',
        ru: 'Знакомимся поближе, играем в настольные игры, спрашиваем про направления ML/AI и просто хорошо проводим время. Снеки и напитки — с нас 🐉'}},
    {id: 'python-basics-2026-10', type: 'workshop', date: '2026-10-15T13:00', end: '2026-10-15T16:00',
      cardTime: '13:00 · 15:00',
      time: {en: '13:00–14:00 and 15:00–16:00', ru: '13:00–14:00 и 15:00–16:00'},
      title: {en: 'Python basics workshop', ru: 'Воркшоп: основы Python'},
      dur: {en: 'Two identical sessions, 1 hour each', ru: 'Две одинаковые сессии по 1 часу'},
      where: {en: 'Classroom 3.6', ru: 'Аудитория 3.6'},
      about: {en: 'Our first workshop: the team walks you through variables, operators, conditionals and functions, then gives you homework exercises to practise. Already know the basics? Feel free to skip this one ✌️',
        ru: 'Наш первый воркшоп: команда разбирает переменные, операторы, условия и функции, а потом даёт домашние упражнения для практики. Если основы уже знаете — этот можно пропустить ✌️'}},
    {id: 'mri-lecture-2026-11', type: 'lecture', date: '2026-11-27T15:00',
      img: 'assets/events/mri-oxygen.jpg', speaker: {en: 'Stefano Zappala', ru: 'Стефано Заппала'},
      title: {en: 'MRI Imaging for Oxygen Physiology', ru: 'МРТ-визуализация в физиологии кислорода'},
      about: {en: 'Guest lecture by Stefano Zappala on MRI imaging for oxygen physiology.',
        ru: 'Гостевая лекция Стефано Заппалы о МРТ-визуализации в физиологии кислорода.'}}
  ],

  // Команда: n — имя, r — роль, d — пара слов о человеке. Аватар — первая буква имени.
  team: [
    {n: 'Dana K.', r: {en: 'Club lead', ru: 'Глава клуба'},
      d: {en: 'Plans the semester and keeps everyone in sync.', ru: 'Планирует семестр и держит всех в курсе.'}},
    {n: 'Arman T.', r: {en: 'Hackathons and datasets', ru: 'Хакатоны и датасеты'},
      d: {en: 'Finds data, writes baselines, runs the leaderboard.', ru: 'Находит данные, пишет бейзлайны, ведёт лидерборд.'}},
    {n: 'Madina S.', r: {en: 'Webinars and mentors', ru: 'Вебинары и менторы'},
      d: {en: 'Books speakers and pairs newcomers with mentors.', ru: 'Зовёт спикеров и подбирает новичкам менторов.'}},
    {n: 'Timur S.', r: {en: 'Partnerships', ru: 'Партнёрства'},
      d: {en: 'Talks to companies about prizes and real datasets.', ru: 'Договаривается с компаниями о призах и настоящих данных.'}},
    {n: 'Aruzhan M.', r: {en: 'Design and media', ru: 'Дизайн и медиа'},
      d: {en: 'Posters, reels and the octopus.', ru: 'Постеры, рилсы и осьминог.'}},
    {n: 'Ilyas B.', r: {en: 'Website and infra', ru: 'Сайт и инфраструктура'},
      d: {en: 'Keeps this site and the compute running.', ru: 'Следит, чтобы сайт и сервера работали.'}}
  ],

  // Анкета вступления. Ответы с сайта уходят прямо в Google-форму клуба «ML&DS society join application»
  // (в ту же таблицу, что и ответы из самой формы). entries — номера полей формы (entry.…);
  // если вопросы в Google-форме поменяются, их нужно обновить здесь. Значения вариантов (v) должны
  // совпадать с вариантами в Google-форме буква в букву; подписи (label) — то, что видно на сайте.
  joinForm: {
    action: 'https://docs.google.com/forms/d/e/1FAIpQLScT3kBgZCNMriNxWR1H26Qy2WIiVhkyTq6rVPbBhBOuucWBsw/formResponse',
    link: 'https://docs.google.com/forms/d/e/1FAIpQLScT3kBgZCNMriNxWR1H26Qy2WIiVhkyTq6rVPbBhBOuucWBsw/viewform',
    entries: {first: 'entry.1511118693', last: 'entry.157977244', studentId: 'entry.797543703',
      major: 'entry.272475857', year: 'entry.608225428', telegram: 'entry.2133093788',
      skills: 'entry.1863939385', motivation: 'entry.1961095562', confirm: 'entry.948103818'},
    majors: [
      {v: 'Computer Science', label: 'Computer Science'},
      {v: 'Civil Engineering', label: 'Civil Engineering'},
      {v: 'Explorational Geology', label: 'Explorational Geology'},
      {v: 'Business & Management', label: 'Business & Management'}
    ],
    years: [
      {v: 'Foundational year', label: {en: 'Foundational year', ru: 'Foundation (подготовительный год)'}},
      {v: 'First year', label: {en: 'First year', ru: '1 курс'}}
    ],
    confirm: 'Yes'
  },

  // Роли по умолчанию для студенческих проектов без своего списка roles
  roles: ['CV', 'NLP', {en: 'Data', ru: 'Данные'}, 'Frontend', 'Backend']
};
