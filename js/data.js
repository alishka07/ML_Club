/*
  Данные сайта CU ML Club.
  Здесь всё, что нужно менять без копания в логике: события, команда, варианты в формах.
  Сейчас это примеры (sample data) — замените на настоящие.

  Любой текст можно писать на двух языках: {en: '...', ru: '...'}.
  Если написать просто строку, она покажется на обоих языках (удобно для имён, метрик, ролей вроде 'NLP').

  Событие (events):
    id      уникальная строка, по ней хранится регистрация в браузере
    type    'club' (хакатон клуба), 'webinar' (вебинар) или 'community' (студенческий проект)
    title   название
    date    дата и время начала в формате 'YYYY-MM-DDTHH:MM' (местное время)
    dur     длительность текстом
    where   где проходит
    seats   всего мест
    taken   сколько уже занято
    about   описание для окна события
  Необязательные поля, показываются в окне события, если заданы:
    metric, data        для хакатонов (метрика и датасет)
    speaker             для вебинаров
    org, roles          для студенческих проектов (организатор и кого ищут)
  Порядок в массиве не важен: на полке карточки сортируются по дате.
*/
window.CLUB = {
  events: [
    {id: 'e1', type: 'club', date: '2026-12-05T10:00', seats: 30, taken: 18, metric: 'RMSE',
      title: {en: 'Mini Kaggle: forecast Astana air quality', ru: 'Мини-Kaggle: прогноз качества воздуха в Астане'},
      dur: {en: 'Sat and Sun, 48 hours', ru: 'Сб и вс, 48 часов'},
      where: {en: 'On campus + Kaggle', ru: 'Кампус + Kaggle'},
      data: {en: 'Hourly PM2.5 and weather readings', ru: 'Почасовые замеры PM2.5 и погоды'},
      about: {en: 'Predict PM2.5 for the next 24 hours. Starter notebook and baseline included. Teams of up to 3.',
        ru: 'Предскажите PM2.5 на следующие 24 часа. Стартовый ноутбук и бейзлайн дадим. Команды до 3 человек.'}},
    {id: 'e2', type: 'webinar', date: '2026-12-09T18:30', seats: 80, taken: 41,
      title: {en: 'PyTorch from zero: tensors to a training loop', ru: 'PyTorch с нуля: от тензоров до цикла обучения'},
      dur: {en: '90 minutes', ru: '90 минут'}, where: {en: 'Online', ru: 'Онлайн'},
      speaker: {en: 'Club mentors', ru: 'Менторы клуба'},
      about: {en: 'Live coding from an empty notebook to a trained classifier. Bring a laptop, no setup needed.',
        ru: 'Пишем вживую: от пустого ноутбука до обученного классификатора. Нужен только ноутбук, ничего ставить не надо.'}},
    {id: 'e4', type: 'club', date: '2026-12-12T10:00', seats: 24, taken: 22, metric: 'Macro F1',
      title: {en: 'Image sprint: sort campus recycling', ru: 'Спринт по картинкам: сортируем мусор кампуса'},
      dur: {en: 'Saturday, 8 hours', ru: 'Суббота, 8 часов'}, where: {en: 'On campus', ru: 'Кампус'},
      data: {en: '2,400 labelled photos of bin contents', ru: '2 400 размеченных фото содержимого урн'},
      about: {en: 'Train a classifier for paper, plastic, glass and mixed waste. Best model gets demoed at the next meetup.',
        ru: 'Обучите классификатор: бумага, пластик, стекло и смешанные отходы. Лучшую модель покажем на следующей встрече.'}},
    {id: 'e5', type: 'webinar', date: '2026-12-16T18:30', seats: 80, taken: 26,
      title: {en: 'How not to overfit the public leaderboard', ru: 'Как не переобучиться на публичный лидерборд'},
      dur: {en: '60 minutes', ru: '60 минут'}, where: {en: 'Online', ru: 'Онлайн'},
      speaker: {en: 'Club mentors', ru: 'Менторы клуба'},
      about: {en: 'Validation splits, leakage and why your public score lies. With examples from past club rounds.',
        ru: 'Валидация, утечки и почему публичный скор врёт. С примерами из прошлых соревнований клуба.'}},
    {id: 'e3', type: 'community', date: '2026-12-19T11:00', seats: 12, taken: 7, org: 'Dana K.',
      roles: ['NLP', {en: 'Data', ru: 'Данные'}, 'Frontend'],
      title: {en: 'Kazakh speech commands', ru: 'Голосовые команды на казахском'},
      dur: {en: '1 day', ru: '1 день'}, where: {en: 'On campus', ru: 'Кампус'},
      about: {en: 'Train a small keyword model for 10 Kazakh voice commands. Needs a data person and someone to build the demo.',
        ru: 'Обучаем небольшую модель на 10 голосовых команд на казахском. Нужен человек по данным и кто-то, кто соберёт демо.'}},
    {id: 'e6', type: 'community', date: '2027-01-16T12:00', seats: 10, taken: 4, org: 'Timur S.',
      roles: [{en: 'Data', ru: 'Данные'}, 'CV'],
      title: {en: 'Bird calls of the steppe', ru: 'Голоса птиц степи'},
      dur: {en: '2 days', ru: '2 дня'}, where: {en: 'Online', ru: 'Онлайн'},
      about: {en: 'Classify bird species from audio spectrograms. Looking for someone to clean recordings and someone strong in CNNs.',
        ru: 'Определяем виды птиц по спектрограммам. Ищем того, кто почистит записи, и того, кто силён в CNN.'}},
    {id: 'e7', type: 'club', date: '2027-01-23T10:00', seats: 30, taken: 9, metric: 'MAE',
      title: {en: 'Winter tabular cup: cafeteria queues', ru: 'Зимний табличный кубок: очереди в столовой'},
      dur: {en: 'Sat and Sun, 48 hours', ru: 'Сб и вс, 48 часов'}, where: {en: 'On campus + Kaggle', ru: 'Кампус + Kaggle'},
      data: {en: 'Till receipts by 15-minute slot, one semester', ru: 'Чеки кассы по 15-минутным слотам за семестр'},
      about: {en: 'Predict how long the cafeteria queue is in each 15-minute slot. Teams of up to 3.',
        ru: 'Предскажите длину очереди в столовой в каждом 15-минутном слоте. Команды до 3 человек.'}},
    {id: 'e8', type: 'webinar', date: '2027-01-27T18:30', seats: 80, taken: 12,
      title: {en: 'Transformers in 60 minutes', ru: 'Трансформеры за 60 минут'},
      dur: {en: '60 minutes', ru: '60 минут'}, where: {en: 'Online', ru: 'Онлайн'},
      speaker: {en: 'Club mentors', ru: 'Менторы клуба'},
      about: {en: 'Attention, tokens and fine-tuning explained with small runnable examples.',
        ru: 'Внимание, токены и дообучение на маленьких примерах, которые можно сразу запустить.'}}
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

  // Чекбоксы «How you want to help» в форме Join the team
  help: [
    {en: 'Run events', ru: 'Проводить события'}, {en: 'Mentor others', ru: 'Менторить'},
    {en: 'Build datasets', ru: 'Собирать датасеты'}, {en: 'Design and media', ru: 'Дизайн и медиа'},
    {en: 'Website and dev', ru: 'Сайт и разработка'}, {en: 'Partnerships', ru: 'Партнёрства'}
  ],

  // Роли по умолчанию для студенческих проектов без своего списка roles
  roles: ['CV', 'NLP', {en: 'Data', ru: 'Данные'}, 'Frontend', 'Backend']
};
