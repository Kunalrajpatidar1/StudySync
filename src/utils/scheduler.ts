import { Video, StudyDay } from "../types";

export function createSchedule(
  videos: Video[],
  budget: number,
  speed: number,
  startDate: string,
  skipWeekends: boolean
): StudyDay[] {
  const available = videos.filter((video) => !video.unavailable);
  const scaled = available.map((video) => ({ ...video, duration: Math.ceil(video.duration / speed) }));
  const total = scaled.reduce((sum, video) => sum + video.duration, 0);
  if (!scaled.length) return [];

  const ideal = total / Math.max(1, Math.ceil(total / budget));
  const days: StudyDay[] = [];
  let current: Video[] = [];
  let currentDuration = 0;
  let date = new Date(`${startDate}T12:00:00`);

  const pushDay = (marathon = false) => {
    if (!current.length) return;
    while (skipWeekends && (date.getDay() === 0 || date.getDay() === 6)) {
      date.setDate(date.getDate() + 1);
    }
    days.push({ date: new Date(date), videos: current, duration: currentDuration, marathon });
    current = [];
    currentDuration = 0;
    date.setDate(date.getDate() + 1);
  };

  for (const video of scaled) {
    if (video.duration > budget) {
      pushDay();
      current = [video];
      currentDuration = video.duration;
      pushDay(true);
      continue;
    }
    if (
      current.length &&
      (currentDuration + video.duration > budget ||
        (currentDuration >= ideal && currentDuration + video.duration > ideal))
    ) {
      pushDay();
    }
    current.push(video);
    currentDuration += video.duration;
  }
  pushDay();
  return days;
}
