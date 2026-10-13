export type Language = "fr" | "en";

/**
 * Dictionnaire de référence (français). Les clés sont à plat et utilisent la
 * notation pointée. Toute clé ajoutée ici doit aussi être présente dans `en`.
 */
const fr = {
  // Common
  "common.cancel": "Annuler",
  "common.delete": "Supprimer",
  "common.save": "Enregistrer",
  "common.saving": "Enregistrement...",
  "common.create": "Créer",
  "common.close": "Fermer",
  "common.back": "Retour",
  "common.loading": "Chargement...",
  "common.search": "Rechercher...",
  "common.noResults": "Aucun résultat",
  "common.select": "Sélectionner",
  "common.seeAll": "Voir tout",
  "common.unknown": "Inconnue",
  "common.unknownCategory": "Catégorie inconnue",
  "common.noCategory": "Sans catégorie",
  "common.noData": "Aucune donnée",
  "common.total": "Total",
  "common.amount": "Montant",
  "common.category": "Catégorie",
  "common.categories": "Catégories",
  "common.date": "Date",
  "common.note": "Note",
  "common.icon": "Icône",
  "common.color": "Couleur",
  "common.name": "Nom",
  "common.type": "Type",
  "common.month": "Mois",
  "common.expense": "Dépense",
  "common.income": "Revenu",
  "common.expenses": "Dépenses",
  "common.incomes": "Revenus",
  "common.both": "Les deux",
  "common.budget": "Budget",
  "common.transaction": "Transaction",
  "common.decrease": "Diminuer",
  "common.increase": "Augmenter",
  "common.removeLabel": "Retirer {label}",
  "common.chooseCategory": "Choisir une catégorie",
  "common.chooseDate": "Choisir une date",
  "common.prevMonth": "Mois précédent",
  "common.nextMonth": "Mois suivant",
  "common.amountPlaceholder": "0,00",
  "common.iconLabel": "Icône {name}",
  "common.colorLabel": "Couleur {color}",
  "common.version": "1.0.0",

  // Validation & errors
  "validation.amountPositive": "Le montant doit être supérieur à 0",
  "validation.selectCategory": "Sélectionnez une catégorie",
  "validation.nameRequired": "Le nom est requis",
  "validation.selectIcon": "Sélectionnez une icône",
  "validation.selectColor": "Sélectionnez une couleur",
  "errors.save": "Erreur lors de la sauvegarde",
  "errors.saveBudget": "Erreur lors de la sauvegarde du budget",
  "errors.loadData": "Erreur lors du chargement des données",
  "errors.createTransaction": "Erreur lors de la création de la transaction",
  "errors.updateTransaction":
    "Erreur lors de la modification de la transaction",
  "errors.deleteTransaction": "Erreur lors de la suppression de la transaction",
  "errors.createCategory": "Erreur lors de la création de la catégorie",
  "errors.updateCategory": "Erreur lors de la modification de la catégorie",
  "errors.deleteCategory": "Erreur lors de la suppression de la catégorie",
  "errors.deleteBudget": "Erreur lors de la suppression du budget",

  // Periods
  "period.today": "Aujourd'hui",
  "period.week": "Cette semaine",
  "period.month": "Ce mois",
  "period.year": "Cette année",
  "period.custom": "Personnalisée",
  "period.customLabel": "Période personnalisée",
  "period.todayShort": "Jour",
  "period.weekShort": "Semaine",
  "period.monthShort": "Mois",
  "period.yearShort": "Année",
  "period.customShort": "Perso",

  // Tabs
  "tabs.home": "Accueil",
  "tabs.transactions": "Transactions",
  "tabs.categories": "Catégories",
  "tabs.budgets": "Budgets",
  "tabs.settings": "Réglages",

  // Dashboard
  "dashboard.title": "Tableau de bord",
  "dashboard.balancePeriod": "Solde · {period}",
  "dashboard.expensesByCategory": "Dépenses par catégorie",
  "dashboard.evolution": "Évolution",
  "dashboard.evolutionSubtitle": "Revenus et dépenses de la période",
  "dashboard.monthBudgets": "Budgets du mois",
  "dashboard.seeAllBudgets": "Voir tous les budgets",
  "dashboard.recentTransactions": "Transactions récentes",
  "dashboard.seeAllTransactions": "Voir toutes les transactions",
  "dashboard.emptyMessage":
    "Commencez par ajouter votre première dépense ou revenu",

  // Transactions
  "transactions.title": "Transactions",
  "transactions.countOne": "{count} opération",
  "transactions.countOther": "{count} opérations",
  "transactions.filters": "Filtres",
  "transactions.filterTypeLabel": "TYPE",
  "transactions.allTypes": "Tous les types",
  "transactions.expenseCategories": "CATÉGORIES DÉPENSES",
  "transactions.incomeCategories": "CATÉGORIES REVENUS",
  "transactions.clearFilters": "Effacer les filtres",
  "transactions.openFilters": "Ouvrir les filtres",
  "transactions.emptyTitle": "Aucune transaction",
  "transactions.emptyMessage": "Commencez par ajouter une transaction",
  "transactions.noMatchFilters":
    "Aucune transaction ne correspond à vos filtres",
  "transactions.addTransaction": "Ajouter une transaction",
  "transactions.filterAll": "Toutes",

  // Transaction form / detail
  "transaction.title": "Transaction",
  "transaction.newTitle": "Nouvelle transaction",
  "transaction.editTitle": "Modifier",
  "transaction.addExpense": "Ajouter une dépense",
  "transaction.addIncome": "Ajouter un revenu",
  "transaction.noteOptional": "Note (optionnel)",
  "transaction.notePlaceholder": "Ajouter une note...",
  "transaction.deleteTitle": "Supprimer la transaction",
  "transaction.deleteMessage":
    "Cette action est irréversible. Voulez-vous continuer ?",
  "transaction.deleteMessageDetail":
    "Cette action est irréversible. La transaction sera supprimée définitivement.",
  "transaction.edit": "Modifier la transaction",
  "transaction.createdAt": "Créée le",
  "transaction.updatedAt": "Modifiée le",

  // Categories
  "categories.title": "Catégories",
  "categories.countOne": "{count} catégorie",
  "categories.countOther": "{count} catégories",
  "categories.create": "Créer une catégorie",
  "categories.newTitle": "Nouvelle catégorie",
  "categories.editTitle": "Modifier la catégorie",
  "categories.namePlaceholder": "Ex: Courses, Transport...",
  "categories.typePlaceholder": "Type de transaction",
  "categories.emptyTitle": "Aucune catégorie",
  "categories.emptyMessage":
    "Créez vos premières catégories pour organiser vos transactions",
  "categories.deleteTitle": "Supprimer la catégorie",
  "categories.deleteMessage":
    "Voulez-vous supprimer « {name} » ? Les transactions associées ne seront pas supprimées.",

  // Noms des catégories par défaut (traduites à l'affichage tant que
  // l'utilisateur ne les a pas renommées : le nom stocké reste l'original)
  "defaultCategory.food": "Alimentation",
  "defaultCategory.transport": "Transport",
  "defaultCategory.shopping": "Shopping",
  "defaultCategory.entertainment": "Loisirs",
  "defaultCategory.bills": "Factures",
  "defaultCategory.health": "Santé",
  "defaultCategory.education": "Éducation",
  "defaultCategory.otherExpense": "Autres",
  "defaultCategory.salary": "Salaire",
  "defaultCategory.freelance": "Freelance",
  "defaultCategory.investments": "Investissements",
  "defaultCategory.gifts": "Cadeaux",
  "defaultCategory.otherIncome": "Autres",

  // Budgets
  "budgets.title": "Budgets",
  "budgets.create": "Créer un budget",
  "budgets.spent": "Dépensé",
  "budgets.newTitle": "Nouveau budget",
  "budgets.editTitle": "Modifier le budget",
  "budgets.over": "Dépassement total",
  "budgets.remainingToSpend": "Restant à dépenser",
  "budgets.totalBudget": "Budget total",
  "budgets.monthlyAmount": "Montant mensuel",
  "budgets.alertThreshold": "Seuil d'alerte : {percent}%",
  "budgets.alertAt": "Alerte à {percent}%",
  "budgets.emptyTitle": "Aucun budget",
  "budgets.emptyMessage":
    "Définissez des budgets pour vos catégories de dépenses",
  "budgets.deleteTitle": "Supprimer le budget",
  "budgets.deleteMessage": "Voulez-vous supprimer ce budget ?",
  "budgets.statusGood": "Dans le budget",
  "budgets.statusWarning": "Attention",
  "budgets.statusOver": "Dépassé",
  "budgets.overShort": "dépassé",
  "budgets.remainingShort": "restant",
  "budgets.editBudget": "Modifier le budget {name}",
  "budgets.deleteBudget": "Supprimer le budget {name}",
  "budgets.ofAmount": "sur {amount}",
  "budgets.overspendOf": "Dépassement de {amount}",
  "budgets.warningUsed": "Attention : {percent}% du budget utilisé",

  // Settings
  "settings.title": "Paramètres",
  "settings.appearance": "Apparence",
  "settings.darkMode": "Mode sombre",
  "settings.darkEnabled": "Thème sombre activé",
  "settings.lightEnabled": "Thème clair activé",
  "settings.language": "Langue",
  "settings.languageDescription": "Langue de l'application",
  "settings.currency": "Devise",
  "settings.currencyDescription": "Devise utilisée pour les montants",
  "settings.format": "Format : {locale}",
  "settings.notifications": "Notifications",
  "settings.enableNotifications": "Activer les notifications",
  "settings.allowLocalNotifications": "Autoriser les notifications locales",
  "settings.budgetAlerts": "Alertes de dépassement de budget",
  "settings.budgetAlertsDesc": "Avertissements et alertes selon vos seuils",
  "settings.dailyReminder": "Rappel quotidien de saisie",
  "settings.everydayAt": "Tous les jours à {time}",
  "settings.reminderTime": "Heure du rappel quotidien",
  "settings.currentlyAt": "Actuellement : {time}",
  "settings.reminderTimeTitle": "Heure du rappel",
  "settings.reminderTimeMessage":
    "Choisissez l'heure à laquelle vous souhaitez recevoir le rappel (approx).",
  "settings.warningThreshold": "Seuil d'alerte préventive",
  "settings.alertAt": "Alerte à {percent}% du budget",
  "settings.about": "À propos",
  "settings.version": "Version",
  "settings.appDescription": "Wallet — gestion de dépenses",
  "settings.terms": "Conditions d'utilisation",
  "settings.termsDesc": "Lire nos conditions d'utilisation",
  "settings.privacy": "Politique de confidentialité",
  "settings.privacyDesc": "Vos données restent sur votre appareil",
  "settings.data": "Données",
  "settings.exportJson": "Exporter une sauvegarde (JSON)",
  "settings.exportJsonDesc": "Catégories, transactions et budgets",
  "settings.exportCsv": "Exporter les transactions (CSV)",
  "settings.exportCsvDesc": "Format tableur (Excel, Numbers…)",
  "settings.importData": "Importer un fichier",
  "settings.importDataDesc": "Restaurer un JSON ou importer un CSV",
  "settings.french": "Français",
  "settings.english": "Anglais",

  // Not found
  "notFound.title": "Page introuvable",
  "notFound.message": "Cette page n'existe pas ou a été déplacée.",
  "notFound.backHome": "Retour à l'accueil",

  // Notifications
  "notifications.channelName": "Alertes budgétaires",
  "notifications.channelDescription": "Notifications d'alerte pour vos budgets",
  "notifications.dailyTitle": "Enregistrez vos dépenses",
  "notifications.dailyBody":
    "Avez-vous eu des dépenses aujourd'hui ? Enregistrez-les en 5 secondes.",
  "notifications.defaultCategory": "catégorie",
  "notifications.budgetExceededTitle": "Budget dépassé",
  "notifications.budgetExceededBody":
    "Budget dépassé de {amount} dans la catégorie {category}.",
  "notifications.budgetReachedTitle": "Budget atteint",
  "notifications.budgetReachedBody":
    "Vous avez atteint le plafond de votre budget {category}.",
  "notifications.budgetWarningTitle": "Alerte budgétaire",
  "notifications.budgetWarningBody":
    "Attention, vous avez consommé {percent}% de votre budget {category} ce mois-ci.",

  // Relative dates
  "date.today": "Aujourd'hui",
  "date.yesterday": "Hier",
  "date.daysAgo": "Il y a {count} jours",
  "date.weeksAgo": "Il y a {count} semaines",
  "date.weekAgo": "Il y a {count} semaine",
  "date.monthsAgo": "Il y a {count} mois",
  "date.yearsAgo": "Il y a {count} ans",
  "date.yearAgo": "Il y a {count} an",

  // Export (CSV headers & section titles)
  "export.sectionTransactions": "=== TRANSACTIONS ===",
  "export.sectionCategories": "=== CATÉGORIES ===",
  "export.sectionBudgets": "=== BUDGETS ===",
  "export.colDate": "Date",
  "export.colType": "Type",
  "export.colCategory": "Catégorie",
  "export.colAmount": "Montant",
  "export.colNote": "Note",
  "export.colBudget": "Budget",
  "export.colSpent": "Dépensé",
  "export.colRemaining": "Restant",
  "export.colName": "Nom",
  "export.colIcon": "Icône",
  "export.colColor": "Couleur",
  "export.colMonthlyBudget": "Budget mensuel",
  "export.colAlertThreshold": "Seuil alerte",
  "export.colPeriodStart": "Période début",
  "export.colPeriodEnd": "Période fin",
  "export.successTitle": "Export réussi",
  "export.successMessage": "Le fichier a été enregistré.",
  "export.errorTitle": "Échec de l'export",
  "export.errorMessage": "Le fichier n'a pas pu être généré.",
  "export.emptyTransactions": "Aucune transaction à exporter.",

  // Import
  "import.title": "Importer des données",
  "import.modeMessage":
    "Comment intégrer ce fichier à vos données existantes ?",
  "import.merge": "Fusionner",
  "import.replace": "Remplacer",
  "import.mergeConfirmMessage":
    "Ajouter le contenu du fichier à vos données existantes ?",
  "import.replaceConfirmMessage":
    "Écraser TOUTES vos données par le contenu du fichier ? Action irréversible.",
  "import.successTitle": "Import terminé",
  "import.successMessage":
    "{categories} catégorie(s), {transactions} transaction(s), {budgets} budget(s)",
  "import.errorTitle": "Échec de l'import",
  "import.errorMessage": "Fichier invalide ou illisible.",

  // Legal — shared
  "legal.lastUpdated": "Dernière mise à jour : {date}",
  "legal.lastUpdatedMonth": "Octobre 2026",

  // Legal — terms
  "legal.terms.title": "Conditions Générales d'Utilisation",
  "legal.terms.a1.title": "Article 1 - Objet",
  "legal.terms.a1.body":
    "La présente application est un outil d'aide à la gestion de budget personnel à titre indicatif. Elle permet à l'utilisateur de saisir, d'organiser et de visualiser ses dépenses, revenus, catégories et budgets. L'utilisation de cette application ne saurait se substituer à des conseils financiers, fiscaux ou juridiques professionnels.",
  "legal.terms.a2.title": "Article 2 - Fonctionnement et Stockage des Données",
  "legal.terms.a2.body1":
    "Cette application fonctionne en mode \"Offline-First\". L'intégralité des données (transactions, catégories, budgets) est stockée exclusivement sur l'appareil de l'utilisateur via une base de données SQLite locale. Aucune donnée n'est transmise, hébergée ou synchronisée sur nos serveurs.",
  "legal.terms.a2.body2":
    "La sauvegarde, la restauration, la sécurité et la gestion des données relèvent de la seule responsabilité de l'utilisateur. La désinstallation de l'application entraîne la suppression définitive des données locales qui y sont associées.",
  "legal.terms.a3.title": "Article 3 - Absence de Conseil Financier",
  "legal.terms.a3.body":
    "L'application ne fournit aucun conseil financier, investissement, fiscal ou juridique. Les informations et statistiques affichées sont issues des données saisies par l'utilisateur et sont données à titre purement indicatif. L'éditeur ne saurait être tenu responsable des erreurs de saisie, des décisions financières, économiques ou patrimoniales prises par l'utilisateur sur la base de ces informations.",
  "legal.terms.a4.title": "Article 4 - Absence de Collecte et de Revente",
  "legal.terms.a4.body":
    "L'éditeur ne collecte, n'enregistre, ne traite, ne vend ni ne loue aucune donnée personnelle ou financière. Aucun identifiant, aucune donnée bancaire, aucun identifiant de transaction tierce n'est collecté par l'application.",
  "legal.terms.a5.title": "Article 5 - Exclusion de Responsabilité",
  "legal.terms.a5.body":
    "Dans les limites autorisées par la loi, l'éditeur décline toute responsabilité en cas de perte de données, de dysfonctionnement, d'erreur de calcul, de dommage indirect ou de tout autre préjudice résultant de l'utilisation ou de l'impossibilité d'utiliser l'application.",
  "legal.terms.a6.title": "Article 6 - Propriété Intellectuelle",
  "legal.terms.a6.body":
    "L'ensemble des éléments de l'application (code source, conception, interfaces, graphismes, logos, textes) est protégé par le droit de la propriété intellectuelle. Toute reproduction, représentation, modification, distribution ou exploitation, partielle ou totale, est interdite sans autorisation préalable de l'éditeur.",
  "legal.terms.a7.title": "Article 7 - Droit Applicable",
  "legal.terms.a7.body":
    "Les présentes CGU sont régies par le droit français. Tout litige relatif à leur interprétation ou à leur exécution relève de la compétence des juridictions françaises.",

  // Legal — privacy
  "legal.privacy.title": "Politique de Confidentialité",
  "legal.privacy.s1.title": "1. Principes Généraux",
  "legal.privacy.s1.body":
    "Cette application est conçue pour fonctionner entièrement en local. Nous attachons une importance particulière à la protection de vos données personnelles et financières. Aucune donnée sensible n'est collectée, transmise ou stockée sur des serveurs externes.",
  "legal.privacy.s2.title": "2. Stockage 100% Local",
  "legal.privacy.s2.body":
    "Toutes les données saisies dans l'application (dépenses, revenus, catégories, budgets, historiques) sont enregistrées exclusivement sur votre appareil à l'aide d'une base de données SQLite locale. Aucune copie de ces données n'est envoyée à nos serveurs, à des sous-traitants ou à des tiers.",
  "legal.privacy.s3.title": "3. Absence de Collecte de Données",
  "legal.privacy.s3.body":
    "L'application ne collecte aucune donnée personnelle identifiable, aucune donnée bancaire, aucun numéro de carte, aucun identifiant de compte ou toute autre information financière sensible. Aucun traçage publicitaire, aucun SDK analytique à des fins de profilage n'est utilisé.",
  "legal.privacy.s4.title": "4. Absence de Vente ou de Partage",
  "legal.privacy.s4.body":
    "Nous ne vendons, ne louons, n'échangeons et ne partageons aucune donnée avec des tiers. Étant donné qu'aucune donnée n'est collectée à distance, aucun partage de données n'est effectué.",
  "legal.privacy.s5.title": "5. Sauvegardes & Perte de Données",
  "legal.privacy.s5.body":
    "Vous êtes le seul responsable de la sauvegarde de vos données. La désinstallation de l'application ou la suppression de son stockage entraînent la perte irréversible des données locales. L'éditeur ne peut être tenu responsable de la perte de données liée à la suppression de l'application, à un effacement de l'appareil ou à toute autre action de l'utilisateur.",
  "legal.privacy.s6.title": "6. Droits (RGPD, CCPA)",
  "legal.privacy.s6.body":
    "Conformément au RGPD (UE) et au CCPA (Californie), vous disposez des droits d'accès, de rectification, de limitation, d'opposition et de suppression de vos données. Dans le cadre de cette application 100% locale, ces droits s'exercent directement : vous pouvez consulter, modifier ou supprimer vos données directement dans l'application, ou les effacer complètement en désinstallant l'application.",
  "legal.privacy.s7.title": "7. Sécurité",
  "legal.privacy.s7.body":
    "L'application s'appuie sur les mécanismes de stockage sécurisé offerts par le système d'exploitation de votre appareil. Aucune transmission réseau n'est initiée pour vos données financières. Toutefois, la sécurité globale de votre appareil reste sous votre responsabilité.",
  "legal.privacy.s8.title": "8. Contact",
  "legal.privacy.s8.body":
    "Pour toute question relative à la présente politique de confidentialité, vous pouvez vous référer aux présentes mentions. Cette politique peut être mise à jour ponctuellement ; la date de dernière mise à jour est indiquée en haut de cette page.",
} as const;

export type TranslationKey = keyof typeof fr;

const en: Record<TranslationKey, string> = {
  // Common
  "common.cancel": "Cancel",
  "common.delete": "Delete",
  "common.save": "Save",
  "common.saving": "Saving...",
  "common.create": "Create",
  "common.close": "Close",
  "common.back": "Back",
  "common.loading": "Loading...",
  "common.search": "Search...",
  "common.noResults": "No results",
  "common.select": "Select",
  "common.seeAll": "See all",
  "common.unknown": "Unknown",
  "common.unknownCategory": "Unknown category",
  "common.noCategory": "No category",
  "common.noData": "No data",
  "common.total": "Total",
  "common.amount": "Amount",
  "common.category": "Category",
  "common.categories": "Categories",
  "common.date": "Date",
  "common.note": "Note",
  "common.icon": "Icon",
  "common.color": "Color",
  "common.name": "Name",
  "common.type": "Type",
  "common.month": "Month",
  "common.expense": "Expense",
  "common.income": "Income",
  "common.expenses": "Expenses",
  "common.incomes": "Income",
  "common.both": "Both",
  "common.budget": "Budget",
  "common.transaction": "Transaction",
  "common.decrease": "Decrease",
  "common.increase": "Increase",
  "common.removeLabel": "Remove {label}",
  "common.chooseCategory": "Choose a category",
  "common.chooseDate": "Choose a date",
  "common.prevMonth": "Previous month",
  "common.nextMonth": "Next month",
  "common.amountPlaceholder": "0.00",
  "common.iconLabel": "Icon {name}",
  "common.colorLabel": "Color {color}",
  "common.version": "1.0.0",

  // Validation & errors
  "validation.amountPositive": "The amount must be greater than 0",
  "validation.selectCategory": "Select a category",
  "validation.nameRequired": "Name is required",
  "validation.selectIcon": "Select an icon",
  "validation.selectColor": "Select a color",
  "errors.save": "Error while saving",
  "errors.saveBudget": "Error while saving the budget",
  "errors.loadData": "Error while loading data",
  "errors.createTransaction": "Error while creating the transaction",
  "errors.updateTransaction": "Error while updating the transaction",
  "errors.deleteTransaction": "Error while deleting the transaction",
  "errors.createCategory": "Error while creating the category",
  "errors.updateCategory": "Error while updating the category",
  "errors.deleteCategory": "Error while deleting the category",
  "errors.deleteBudget": "Error while deleting the budget",

  // Periods
  "period.today": "Today",
  "period.week": "This week",
  "period.month": "This month",
  "period.year": "This year",
  "period.custom": "Custom",
  "period.customLabel": "Custom period",
  "period.todayShort": "Day",
  "period.weekShort": "Week",
  "period.monthShort": "Month",
  "period.yearShort": "Year",
  "period.customShort": "Custom",

  // Tabs
  "tabs.home": "Home",
  "tabs.transactions": "Transactions",
  "tabs.categories": "Categories",
  "tabs.budgets": "Budgets",
  "tabs.settings": "Settings",

  // Dashboard
  "dashboard.title": "Dashboard",
  "dashboard.balancePeriod": "Balance · {period}",
  "dashboard.expensesByCategory": "Expenses by category",
  "dashboard.evolution": "Trend",
  "dashboard.evolutionSubtitle": "Income and expenses for the period",
  "dashboard.monthBudgets": "Monthly budgets",
  "dashboard.seeAllBudgets": "See all budgets",
  "dashboard.recentTransactions": "Recent transactions",
  "dashboard.seeAllTransactions": "See all transactions",
  "dashboard.emptyMessage": "Start by adding your first expense or income",

  // Transactions
  "transactions.title": "Transactions",
  "transactions.countOne": "{count} transaction",
  "transactions.countOther": "{count} transactions",
  "transactions.filters": "Filters",
  "transactions.filterTypeLabel": "TYPE",
  "transactions.allTypes": "All types",
  "transactions.expenseCategories": "EXPENSE CATEGORIES",
  "transactions.incomeCategories": "INCOME CATEGORIES",
  "transactions.clearFilters": "Clear filters",
  "transactions.openFilters": "Open filters",
  "transactions.emptyTitle": "No transactions",
  "transactions.emptyMessage": "Start by adding a transaction",
  "transactions.noMatchFilters": "No transaction matches your filters",
  "transactions.addTransaction": "Add a transaction",
  "transactions.filterAll": "All",

  // Transaction form / detail
  "transaction.title": "Transaction",
  "transaction.newTitle": "New transaction",
  "transaction.editTitle": "Edit",
  "transaction.addExpense": "Add an expense",
  "transaction.addIncome": "Add income",
  "transaction.noteOptional": "Note (optional)",
  "transaction.notePlaceholder": "Add a note...",
  "transaction.deleteTitle": "Delete transaction",
  "transaction.deleteMessage":
    "This action cannot be undone. Do you want to continue?",
  "transaction.deleteMessageDetail":
    "This action cannot be undone. The transaction will be permanently deleted.",
  "transaction.edit": "Edit transaction",
  "transaction.createdAt": "Created on",
  "transaction.updatedAt": "Updated on",

  // Categories
  "categories.title": "Categories",
  "categories.countOne": "{count} category",
  "categories.countOther": "{count} categories",
  "categories.create": "Create a category",
  "categories.newTitle": "New category",
  "categories.editTitle": "Edit category",
  "categories.namePlaceholder": "E.g. Groceries, Transport...",
  "categories.typePlaceholder": "Transaction type",
  "categories.emptyTitle": "No categories",
  "categories.emptyMessage":
    "Create your first categories to organize your transactions",
  "categories.deleteTitle": "Delete category",
  "categories.deleteMessage":
    "Do you want to delete “{name}”? Associated transactions will not be deleted.",

  // Default category names (kept translatable at display time, the stored
  // name stays the original until the user renames the category)
  "defaultCategory.food": "Food & Dining",
  "defaultCategory.transport": "Transportation",
  "defaultCategory.shopping": "Shopping",
  "defaultCategory.entertainment": "Entertainment",
  "defaultCategory.bills": "Bills & Utilities",
  "defaultCategory.health": "Healthcare",
  "defaultCategory.education": "Education",
  "defaultCategory.otherExpense": "Other",
  "defaultCategory.salary": "Salary",
  "defaultCategory.freelance": "Freelance",
  "defaultCategory.investments": "Investments",
  "defaultCategory.gifts": "Gifts",
  "defaultCategory.otherIncome": "Other",

  // Budgets
  "budgets.title": "Budgets",
  "budgets.create": "Create a budget",
  "budgets.spent": "Spent",
  "budgets.newTitle": "New budget",
  "budgets.editTitle": "Edit budget",
  "budgets.over": "Total overspend",
  "budgets.remainingToSpend": "Left to spend",
  "budgets.totalBudget": "Total budget",
  "budgets.monthlyAmount": "Monthly amount",
  "budgets.alertThreshold": "Alert threshold: {percent}%",
  "budgets.alertAt": "Alert at {percent}%",
  "budgets.emptyTitle": "No budget",
  "budgets.emptyMessage": "Set budgets for your expense categories",
  "budgets.deleteTitle": "Delete budget",
  "budgets.deleteMessage": "Do you want to delete this budget?",
  "budgets.statusGood": "Within budget",
  "budgets.statusWarning": "Warning",
  "budgets.statusOver": "Over budget",
  "budgets.overShort": "over",
  "budgets.remainingShort": "left",
  "budgets.editBudget": "Edit budget {name}",
  "budgets.deleteBudget": "Delete budget {name}",
  "budgets.ofAmount": "of {amount}",
  "budgets.overspendOf": "Overspend of {amount}",
  "budgets.warningUsed": "Warning: {percent}% of budget used",

  // Settings
  "settings.title": "Settings",
  "settings.appearance": "Appearance",
  "settings.darkMode": "Dark mode",
  "settings.darkEnabled": "Dark theme enabled",
  "settings.lightEnabled": "Light theme enabled",
  "settings.language": "Language",
  "settings.languageDescription": "App language",
  "settings.currency": "Currency",
  "settings.currencyDescription": "Currency used for amounts",
  "settings.format": "Format: {locale}",
  "settings.notifications": "Notifications",
  "settings.enableNotifications": "Enable notifications",
  "settings.allowLocalNotifications": "Allow local notifications",
  "settings.budgetAlerts": "Budget overrun alerts",
  "settings.budgetAlertsDesc": "Warnings and alerts based on your thresholds",
  "settings.dailyReminder": "Daily entry reminder",
  "settings.everydayAt": "Every day at {time}",
  "settings.reminderTime": "Daily reminder time",
  "settings.currentlyAt": "Currently: {time}",
  "settings.reminderTimeTitle": "Reminder time",
  "settings.reminderTimeMessage":
    "Choose the time at which you would like to receive the reminder (approx).",
  "settings.warningThreshold": "Preventive alert threshold",
  "settings.alertAt": "Alert at {percent}% of budget",
  "settings.about": "About",
  "settings.version": "Version",
  "settings.appDescription": "Wallet — expense tracking",
  "settings.terms": "Terms of use",
  "settings.termsDesc": "Read our terms of use",
  "settings.privacy": "Privacy policy",
  "settings.privacyDesc": "Your data stays on your device",
  "settings.data": "Data",
  "settings.exportJson": "Export a backup (JSON)",
  "settings.exportJsonDesc": "Categories, transactions and budgets",
  "settings.exportCsv": "Export transactions (CSV)",
  "settings.exportCsvDesc": "Spreadsheet format (Excel, Numbers…)",
  "settings.importData": "Import a file",
  "settings.importDataDesc": "Restore a JSON backup or import a CSV",
  "settings.french": "French",
  "settings.english": "English",

  // Not found
  "notFound.title": "Page not found",
  "notFound.message": "This page does not exist or has been moved.",
  "notFound.backHome": "Back to home",

  // Notifications
  "notifications.channelName": "Budget alerts",
  "notifications.channelDescription": "Alert notifications for your budgets",
  "notifications.dailyTitle": "Log your expenses",
  "notifications.dailyBody":
    "Did you have any expenses today? Log them in 5 seconds.",
  "notifications.defaultCategory": "category",
  "notifications.budgetExceededTitle": "Budget exceeded",
  "notifications.budgetExceededBody":
    "Budget exceeded by {amount} in the {category} category.",
  "notifications.budgetReachedTitle": "Budget reached",
  "notifications.budgetReachedBody":
    "You have reached the limit of your {category} budget.",
  "notifications.budgetWarningTitle": "Budget alert",
  "notifications.budgetWarningBody":
    "Careful, you have used {percent}% of your {category} budget this month.",

  // Relative dates
  "date.today": "Today",
  "date.yesterday": "Yesterday",
  "date.daysAgo": "{count} days ago",
  "date.weeksAgo": "{count} weeks ago",
  "date.weekAgo": "{count} week ago",
  "date.monthsAgo": "{count} months ago",
  "date.yearsAgo": "{count} years ago",
  "date.yearAgo": "{count} year ago",

  // Export (CSV headers & section titles)
  "export.sectionTransactions": "=== TRANSACTIONS ===",
  "export.sectionCategories": "=== CATEGORIES ===",
  "export.sectionBudgets": "=== BUDGETS ===",
  "export.colDate": "Date",
  "export.colType": "Type",
  "export.colCategory": "Category",
  "export.colAmount": "Amount",
  "export.colNote": "Note",
  "export.colBudget": "Budget",
  "export.colSpent": "Spent",
  "export.colRemaining": "Remaining",
  "export.colName": "Name",
  "export.colIcon": "Icon",
  "export.colColor": "Color",
  "export.colMonthlyBudget": "Monthly budget",
  "export.colAlertThreshold": "Alert threshold",
  "export.colPeriodStart": "Period start",
  "export.colPeriodEnd": "Period end",
  "export.successTitle": "Export complete",
  "export.successMessage": "The file has been saved.",
  "export.errorTitle": "Export failed",
  "export.errorMessage": "The file could not be generated.",
  "export.emptyTransactions": "There are no transactions to export.",

  // Import
  "import.title": "Import data",
  "import.modeMessage":
    "How should this file be merged with your existing data?",
  "import.merge": "Merge",
  "import.replace": "Replace",
  "import.mergeConfirmMessage": "Add the file contents to your existing data?",
  "import.replaceConfirmMessage":
    "Overwrite ALL your data with the file contents? This cannot be undone.",
  "import.successTitle": "Import complete",
  "import.successMessage":
    "{categories} categories, {transactions} transactions, {budgets} budgets",
  "import.errorTitle": "Import failed",
  "import.errorMessage": "Invalid or unreadable file.",

  // Legal — shared
  "legal.lastUpdated": "Last updated: {date}",
  "legal.lastUpdatedMonth": "October 2026",

  // Legal — terms
  "legal.terms.title": "Terms of Use",
  "legal.terms.a1.title": "Article 1 - Purpose",
  "legal.terms.a1.body":
    "This application is a personal budgeting aid tool provided for informational purposes. It allows the user to enter, organize and view their expenses, income, categories and budgets. Use of this application cannot replace professional financial, tax or legal advice.",
  "legal.terms.a2.title": "Article 2 - Operation and Data Storage",
  "legal.terms.a2.body1":
    'This application works in "Offline-First" mode. All data (transactions, categories, budgets) is stored exclusively on the user\'s device via a local SQLite database. No data is transmitted, hosted or synchronized on our servers.',
  "legal.terms.a2.body2":
    "Backup, restore, security and data management are the sole responsibility of the user. Uninstalling the application results in the permanent deletion of the local data associated with it.",
  "legal.terms.a3.title": "Article 3 - No Financial Advice",
  "legal.terms.a3.body":
    "The application does not provide any financial, investment, tax or legal advice. The information and statistics displayed are derived from the data entered by the user and are provided purely for informational purposes. The publisher cannot be held liable for input errors or financial, economic or patrimonial decisions made by the user on the basis of this information.",
  "legal.terms.a4.title": "Article 4 - No Collection or Resale",
  "legal.terms.a4.body":
    "The publisher does not collect, record, process, sell or rent any personal or financial data. No identifier, banking data or third-party transaction identifier is collected by the application.",
  "legal.terms.a5.title": "Article 5 - Limitation of Liability",
  "legal.terms.a5.body":
    "To the extent permitted by law, the publisher disclaims all liability in the event of data loss, malfunction, calculation error, indirect damage or any other harm resulting from the use of, or inability to use, the application.",
  "legal.terms.a6.title": "Article 6 - Intellectual Property",
  "legal.terms.a6.body":
    "All elements of the application (source code, design, interfaces, graphics, logos, texts) are protected by intellectual property law. Any reproduction, representation, modification, distribution or exploitation, in whole or in part, is prohibited without the prior authorization of the publisher.",
  "legal.terms.a7.title": "Article 7 - Governing Law",
  "legal.terms.a7.body":
    "These Terms are governed by French law. Any dispute relating to their interpretation or performance falls under the jurisdiction of the French courts.",

  // Legal — privacy
  "legal.privacy.title": "Privacy Policy",
  "legal.privacy.s1.title": "1. General Principles",
  "legal.privacy.s1.body":
    "This application is designed to work entirely locally. We attach particular importance to the protection of your personal and financial data. No sensitive data is collected, transmitted or stored on external servers.",
  "legal.privacy.s2.title": "2. 100% Local Storage",
  "legal.privacy.s2.body":
    "All data entered in the application (expenses, income, categories, budgets, history) is stored exclusively on your device using a local SQLite database. No copy of this data is sent to our servers, subcontractors or third parties.",
  "legal.privacy.s3.title": "3. No Data Collection",
  "legal.privacy.s3.body":
    "The application does not collect any identifiable personal data, banking data, card numbers, account identifiers or any other sensitive financial information. No advertising tracking or analytics SDK for profiling purposes is used.",
  "legal.privacy.s4.title": "4. No Sale or Sharing",
  "legal.privacy.s4.body":
    "We do not sell, rent, exchange or share any data with third parties. Since no data is collected remotely, no data sharing is performed.",
  "legal.privacy.s5.title": "5. Backups & Data Loss",
  "legal.privacy.s5.body":
    "You are solely responsible for backing up your data. Uninstalling the application or deleting its storage results in the irreversible loss of local data. The publisher cannot be held liable for data loss related to uninstalling the application, wiping the device or any other action by the user.",
  "legal.privacy.s6.title": "6. Rights (GDPR, CCPA)",
  "legal.privacy.s6.body":
    "In accordance with the GDPR (EU) and the CCPA (California), you have the rights of access, rectification, restriction, objection and deletion of your data. In the context of this 100% local application, these rights are exercised directly: you can view, modify or delete your data directly in the application, or erase it completely by uninstalling the application.",
  "legal.privacy.s7.title": "7. Security",
  "legal.privacy.s7.body":
    "The application relies on the secure storage mechanisms offered by your device's operating system. No network transmission is initiated for your financial data. However, the overall security of your device remains your responsibility.",
  "legal.privacy.s8.title": "8. Contact",
  "legal.privacy.s8.body":
    "For any question relating to this privacy policy, you may refer to these statements. This policy may be updated from time to time; the last update date is indicated at the top of this page.",
};

export const translations: Record<Language, Record<TranslationKey, string>> = {
  fr,
  en,
};

export const LANGUAGE_LOCALES: Record<Language, string> = {
  fr: "fr-FR",
  en: "en-US",
};

export const LANGUAGES: { code: Language; labelKey: TranslationKey }[] = [
  { code: "fr", labelKey: "settings.french" },
  { code: "en", labelKey: "settings.english" },
];
