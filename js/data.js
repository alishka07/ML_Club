/*
  Данные сайта CU ML Club.
  Здесь всё, что нужно менять без копания в логике: события, команда, варианты в формах.
  Сейчас это примеры (sample data) — замените на настоящие.

  Событие (events):
    id      уникальная строка, по ней хранится регистрация в браузере
    type    'club' (Club hackathon), 'webinar' (Webinar) или 'community' (Student-run)
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
    {id: 'e1', type: 'club', title: 'Mini Kaggle: forecast Astana air quality', date: '2026-12-05T10:00',
      dur: 'Sat and Sun, 48 hours', where: 'On campus + Kaggle', seats: 30, taken: 18,
      metric: 'RMSE', data: 'Hourly PM2.5 and weather readings',
      about: 'Predict PM2.5 for the next 24 hours. Starter notebook and baseline included. Teams of up to 3.'},
    {id: 'e2', type: 'webinar', title: 'PyTorch from zero: tensors to a training loop', date: '2026-12-09T18:30',
      dur: '90 minutes', where: 'Online', seats: 80, taken: 41, speaker: 'Club mentors',
      about: 'Live coding from an empty notebook to a trained classifier. Bring a laptop, no setup needed.'},
    {id: 'e4', type: 'club', title: 'Image sprint: sort campus recycling', date: '2026-12-12T10:00',
      dur: 'Saturday, 8 hours', where: 'On campus', seats: 24, taken: 22,
      metric: 'Macro F1', data: '2,400 labelled photos of bin contents',
      about: 'Train a classifier for paper, plastic, glass and mixed waste. Best model gets demoed at the next meetup.'},
    {id: 'e5', type: 'webinar', title: 'How not to overfit the public leaderboard', date: '2026-12-16T18:30',
      dur: '60 minutes', where: 'Online', seats: 80, taken: 26, speaker: 'Club mentors',
      about: 'Validation splits, leakage and why your public score lies. With examples from past club rounds.'},
    {id: 'e3', type: 'community', title: 'Kazakh speech commands', date: '2026-12-19T11:00',
      dur: '1 day', where: 'On campus', seats: 12, taken: 7, org: 'Dana K.', roles: ['NLP', 'Data', 'Frontend'],
      about: 'Train a small keyword model for 10 Kazakh voice commands. Needs a data person and someone to build the demo.'},
    {id: 'e6', type: 'community', title: 'Bird calls of the steppe', date: '2027-01-16T12:00',
      dur: '2 days', where: 'Online', seats: 10, taken: 4, org: 'Timur S.', roles: ['Data', 'CV'],
      about: 'Classify bird species from audio spectrograms. Looking for someone to clean recordings and someone strong in CNNs.'},
    {id: 'e7', type: 'club', title: 'Winter tabular cup: cafeteria queues', date: '2027-01-23T10:00',
      dur: 'Sat and Sun, 48 hours', where: 'On campus + Kaggle', seats: 30, taken: 9,
      metric: 'MAE', data: 'Till receipts by 15-minute slot, one semester',
      about: 'Predict how long the cafeteria queue is in each 15-minute slot. Teams of up to 3.'},
    {id: 'e8', type: 'webinar', title: 'Transformers in 60 minutes', date: '2027-01-27T18:30',
      dur: '60 minutes', where: 'Online', seats: 80, taken: 12, speaker: 'Club mentors',
      about: 'Attention, tokens and fine-tuning explained with small runnable examples.'}
  ],

  // Команда: n — имя, r — роль, d — пара слов о человеке. Аватар — первая буква имени.
  team: [
    {n: 'Dana K.', r: 'Club lead', d: 'Plans the semester and keeps everyone in sync.'},
    {n: 'Arman T.', r: 'Hackathons and datasets', d: 'Finds data, writes baselines, runs the leaderboard.'},
    {n: 'Madina S.', r: 'Webinars and mentors', d: 'Books speakers and pairs newcomers with mentors.'},
    {n: 'Timur S.', r: 'Partnerships', d: 'Talks to companies about prizes and real datasets.'},
    {n: 'Aruzhan M.', r: 'Design and media', d: 'Posters, reels and the octopus.'},
    {n: 'Ilyas B.', r: 'Website and infra', d: 'Keeps this site and the compute running.'}
  ],

  // Чекбоксы «How you want to help» в форме Join the team
  help: ['Run events', 'Mentor others', 'Build datasets', 'Design and media', 'Website and dev', 'Partnerships'],

  // Роли по умолчанию для студенческих проектов без своего списка roles
  roles: ['CV', 'NLP', 'Data', 'Frontend', 'Backend']
};
