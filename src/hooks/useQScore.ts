import {useEffect, useState} from 'react';
import {labLogs} from '../data/labLog';
import {papers} from '../data/papers';
import {
  computeQScore,
  getLocalInteractionPoints,
  Q_INTERACTIONS_STORAGE_KEY,
  Q_SCORE_UPDATED_EVENT,
  type QScoreBreakdown,
} from '../utils/qScore';

export function useQScore(
  papersCount: number = papers.length,
  labLogsCount: number = labLogs.length,
): QScoreBreakdown {
  const [interactionPoints, setInteractionPoints] = useState<number>(() =>
    getLocalInteractionPoints(),
  );

  useEffect(() => {
    const sync = () => {
      setInteractionPoints(getLocalInteractionPoints());
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === Q_INTERACTIONS_STORAGE_KEY) {
        sync();
      }
    };

    sync();
    window.addEventListener(Q_SCORE_UPDATED_EVENT, sync);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(Q_SCORE_UPDATED_EVENT, sync);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return computeQScore({
    papersCount,
    labLogsCount,
    interactionPoints,
  });
}
