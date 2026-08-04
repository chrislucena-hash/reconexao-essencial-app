
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.log("Este navegador não suporta notificações.");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export const sendPresenceReminder = (title: string, body: string) => {
  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/favicon.ico", // Pode ser substituído por um ícone de lótus
    });
  }
};

export const scheduleDailyReminder = () => {
  // Nota: Em uma aplicação web real, lembretes agendados dependem de Service Workers.
  // Aqui simularemos a intenção de agendamento para a experiência do usuário.
  console.log("Lembrete diário de presença agendado para o despertar.");
};
