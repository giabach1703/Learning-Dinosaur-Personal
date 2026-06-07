export default [
  { path: '/login', component: '@/pages/LoginPage' },
  { path: '/register', component: '@/pages/RegisterPage' },
  {
    path: '/',
    component: '@/layouts/MainLayout',
    routes: [
      { path: '/', component: '@/pages/index' },
      { path: '/decks/new', component: '@/pages/CreateDeckPage' },
      { path: '/decks/:deckId', component: '@/pages/DeckDetailPage' },
      { path: '/decks/:deckId/study', component: '@/pages/StudyPage' },
      { path: '/statistics', component: '@/pages/StatisticsPage' },
      { path: '/achievements', component: '@/pages/AchievementsPage' },
      { path: '/settings', component: '@/pages/SettingsPage' },
      { path: '/notifications', component: '@/pages/NotificationsPage' },
      { path: '/expert-solutions', component: '@/pages/ExpertSolutionsPage' },
    ],
  },
];
